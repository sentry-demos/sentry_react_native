# Flask Backend for Empower Plant

This is the Flask backend for the Empower Plant React Native application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
cd src
python main.py
```

The server will start on `http://0.0.0.0:8080`

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /success` - Success endpoint for testing
- `GET /products` - Get all products
- `GET /products/<id>` - Get specific product
- `POST /checkout` - Process checkout
- `GET /orders` - Get all orders
- `GET /orders/<id>` - Get specific order

## Testing

Run tests with pytest:
```bash
pytest tests/
```

## Bug Fix

This repository contains a fix for issue MOBILE-REACT-NATIVE-1:

**Problem**: The checkout endpoint was raising an `UnboundLocalError` because the `quantities` variable was being checked on line 225 before it was defined on line 228.

**Solution**: Moved the `quantities` variable assignment (`quantities = {int(k): v for k, v in cart['quantities'].items()}`) to before the empty cart check (`if len(quantities) == 0`).

This fix ensures that the variable is defined before it's used, preventing the 500 INTERNAL SERVER ERROR.
