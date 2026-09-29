# Backend Fix for MOBILE-REACT-NATIVE-4S

## Issue Summary
Flask `/checkout` endpoint references local variable `quantities` before assignment, raising `UnboundLocalError` that surfaces as HTTP 500 to the mobile app.

## Root Cause
In the Flask backend repository (`sentry-demos/empower`), file `flask/src/main.py`:
- Line 225 does `len(quantities)` before `quantities` is assigned on line 228
- The order-validation code checks the variable before defining it

## Reproduction Steps
1. Open the mobile app and add items to the cart
2. Tap Submit Checkout, sending POST to flask.empower-plant.com/checkout
3. Flask executes `len(quantities)` before `quantities` is assigned
4. `UnboundLocalError` is raised and re-raised, returning HTTP 500
5. Mobile placeOrder captures '500 - INTERNAL SERVER ERROR'

## Fix Required
**Repository**: `sentry-demos/empower`  
**File**: `flask/src/main.py`  
**Lines**: 223-229

### Current Code (Broken)
```python
    try:
        if validate_inventory:
            with sentry_sdk.start_span(op="code.block", name="checkout.process_order"):
                if len(quantities) == 0:  # ❌ ERROR: quantities not yet defined
                    raise Exception("Invalid checkout request: cart is empty")

                quantities = {int(k): v for k, v in cart['quantities'].items()}  # Defined here
                inventory_dict = {x.productid: x for x in inventory}
```

### Fixed Code
```python
    try:
        if validate_inventory:
            with sentry_sdk.start_span(op="code.block", name="checkout.process_order"):
                quantities = {int(k): v for k, v in cart['quantities'].items()}  # ✅ Define first
                if len(quantities) == 0:
                    raise Exception("Invalid checkout request: cart is empty")

                inventory_dict = {x.productid: x for x in inventory}
```

## Implementation Instructions
1. Clone the `sentry-demos/empower` repository
2. Create branch `error-500---wxj3au` from `master`
3. Edit `flask/src/main.py` line 225-228
4. Move the `quantities` assignment (currently line 228) to before the `len()` check (currently line 225)
5. Commit with message including "Fixes MOBILE-REACT-NATIVE-4S"
6. Push to branch and create PR

## Verification
After applying the fix:
1. Deploy the Flask backend
2. Test checkout flow from mobile app
3. Verify no UnboundLocalError occurs
4. Confirm HTTP 200 response on successful checkout

## Notes
- This is a one-line fix (moving the assignment)
- No logic changes required
- The fix prevents the variable from being used before it's defined
