import pytest
import json
from app import app, db
from models import Product

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            # Setup test data
            product1 = Product(id=1, name="Test Plant 1", price=19.99, inventory=5)
            product2 = Product(id=2, name="Test Plant 2", price=29.99, inventory=2)
            db.session.add(product1)
            db.session.add(product2)
            db.session.commit()
            yield client
            db.session.remove()
            db.drop_all()

def test_checkout_inventory_validation(client):
    """Test that checkout returns proper error when inventory is insufficient"""
    # Create a cart with more items than available in inventory
    cart_data = {
        "cart": {
            "items": [
                {"id": 1, "name": "Test Plant 1", "price": 19.99, "quantity": 1},
                {"id": 2, "name": "Test Plant 2", "price": 29.99, "quantity": 5}  # Only 2 in stock
            ],
            "quantities": {"1": 1, "2": 5}
        },
        "form": {
            "email": "test@example.com",
            "firstName": "Test",
            "lastName": "User"
        }
    }
    
    response = client.post(
        '/checkout',
        data=json.dumps(cart_data),
        content_type='application/json'
    )
    
    # Assert that we get a 422 Unprocessable Entity status code
    assert response.status_code == 422
    
    # Assert that the response contains the expected error details
    data = json.loads(response.data)
    assert data['error'] == 'inventory_validation_failed'
    assert 'Not enough inventory' in data['message']
    assert len(data['details']) == 1
    assert data['details'][0]['id'] == 2
    assert data['details'][0]['requested'] == 5
    assert data['details'][0]['available'] == 2

def test_checkout_successful(client):
    """Test that checkout works when inventory is sufficient"""
    # Create a cart with items within inventory limits
    cart_data = {
        "cart": {
            "items": [
                {"id": 1, "name": "Test Plant 1", "price": 19.99, "quantity": 2},
                {"id": 2, "name": "Test Plant 2", "price": 29.99, "quantity": 1}
            ],
            "quantities": {"1": 2, "2": 1}
        },
        "form": {
            "email": "test@example.com",
            "firstName": "Test",
            "lastName": "User"
        }
    }
    
    response = client.post(
        '/checkout',
        data=json.dumps(cart_data),
        content_type='application/json'
    )
    
    # Assert that we get a 200 OK status code
    assert response.status_code == 200
    
    # Verify that inventory was updated
    with app.app_context():
        product1 = Product.query.get(1)
        product2 = Product.query.get(2)
        assert product1.inventory == 3  # Started with 5, used 2
        assert product2.inventory == 1  # Started with 2, used 1