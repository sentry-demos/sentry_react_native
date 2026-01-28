from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///empowerplant.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    inventory = db.Column(db.Integer, nullable=False, default=0)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(200))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'inventory': self.inventory,
            'description': self.description,
            'image_url': self.image_url
        }

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    address = db.Column(db.String(200))
    city = db.Column(db.String(50))
    state = db.Column(db.String(50))
    country_region = db.Column(db.String(50))
    zip_code = db.Column(db.String(20))
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'total_amount': self.total_amount,
            'status': self.status
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)

    order = db.relationship('Order', backref=db.backref('items', lazy=True))
    product = db.relationship('Product', backref=db.backref('order_items', lazy=True))

# Routes
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

@app.route('/success', methods=['GET'])
def success():
    return jsonify({'status': 'success'}), 200

@app.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products]), 200

@app.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify(product.to_dict()), 200

@app.route('/checkout', methods=['POST'])
def checkout():
    """
    Process checkout request.
    Expected request body:
    {
        "cart": {
            "items": [{"id": 1, "name": "Plant", "price": 19.99, "quantity": 2}],
            "quantities": {"1": 2}
        },
        "form": {
            "email": "user@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "address": "123 Main St",
            "city": "San Francisco",
            "state": "CA",
            "countryRegion": "USA",
            "zipCode": "94102"
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        cart = data.get('cart', {})
        form = data.get('form', {})
        
        if not cart:
            return jsonify({'error': 'Cart is required'}), 400
        
        if not form:
            return jsonify({'error': 'Form data is required'}), 400
        
        # Get items and quantities from cart
        items = cart.get('items', [])
        
        # Define quantities first (FIXED: moved this before the check)
        quantities = {int(k): v for k, v in cart['quantities'].items()}
        
        # Check if cart is empty
        if len(quantities) == 0:
            return jsonify({'error': 'Cart is empty'}), 400
        
        # Validate inventory for each product
        inventory_errors = []
        for product_id, quantity in quantities.items():
            product = Product.query.get(product_id)
            if not product:
                return jsonify({'error': f'Product {product_id} not found'}), 404
            
            if product.inventory < quantity:
                inventory_errors.append({
                    'id': product_id,
                    'name': product.name,
                    'requested': quantity,
                    'available': product.inventory
                })
        
        # If there are inventory errors, return them
        if inventory_errors:
            return jsonify({
                'error': 'inventory_validation_failed',
                'message': 'Not enough inventory for some items',
                'details': inventory_errors
            }), 422
        
        # Calculate total amount
        total_amount = 0
        for item in items:
            total_amount += item['price'] * item['quantity']
        
        # Create order
        order = Order(
            email=form.get('email'),
            first_name=form.get('firstName'),
            last_name=form.get('lastName'),
            address=form.get('address'),
            city=form.get('city'),
            state=form.get('state'),
            country_region=form.get('countryRegion'),
            zip_code=form.get('zipCode'),
            total_amount=total_amount
        )
        
        db.session.add(order)
        db.session.flush()  # Get order ID
        
        # Create order items and update inventory
        for product_id, quantity in quantities.items():
            product = Product.query.get(product_id)
            
            order_item = OrderItem(
                order_id=order.id,
                product_id=product_id,
                quantity=quantity,
                price=product.price
            )
            db.session.add(order_item)
            
            # Update inventory
            product.inventory -= quantity
        
        db.session.commit()
        
        return jsonify({
            'message': 'Order placed successfully',
            'order_id': order.id,
            'total_amount': total_amount
        }), 200
        
    except Exception as e:
        db.session.rollback()
        # Log the error
        print(f"Error processing checkout: {str(e)}")
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500

@app.route('/orders', methods=['GET'])
def get_orders():
    orders = Order.query.all()
    return jsonify([o.to_dict() for o in orders]), 200

@app.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    order = Order.query.get_or_404(order_id)
    return jsonify(order.to_dict()), 200

# Initialize database
@app.before_first_request
def create_tables():
    db.create_all()
    
    # Add sample products if none exist
    if Product.query.count() == 0:
        sample_products = [
            Product(id=1, name='Spider Plant', price=19.99, inventory=10, 
                   description='Easy to care for houseplant'),
            Product(id=2, name='Monstera Deliciosa', price=29.99, inventory=5,
                   description='Popular tropical plant'),
            Product(id=3, name='Snake Plant', price=24.99, inventory=8,
                   description='Low maintenance succulent'),
            Product(id=4, name='Pothos', price=15.99, inventory=15,
                   description='Trailing vine plant'),
            Product(id=5, name='Peace Lily', price=22.99, inventory=7,
                   description='Beautiful flowering plant')
        ]
        for product in sample_products:
            db.session.add(product)
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
