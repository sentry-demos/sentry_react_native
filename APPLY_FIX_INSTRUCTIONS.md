# Quick Fix Instructions for sentry-demos/empower Repository

## Immediate Action Required

Someone with write access to `sentry-demos/empower` needs to apply this fix to resolve the HTTP 500 error in the checkout endpoint.

## Option 1: Apply the Patch (Fastest)

```bash
# Clone the empower repository
git clone https://github.com/sentry-demos/empower.git
cd empower

# Create fix branch
git checkout -b error-500---wxj3au

# Download and apply the patch from this PR
curl -o fix.patch https://raw.githubusercontent.com/sentry-demos/sentry_react_native/error-500---wxj3au/BACKEND_FIX.patch
git am fix.patch

# Push to remote
git push -u origin error-500---wxj3au

# Create PR to merge to master
```

## Option 2: Manual Fix (30 seconds)

1. Open `flask/src/main.py` in the empower repository
2. Go to line 225
3. Find these lines:
   ```python
                if len(quantities) == 0:
                    raise Exception("Invalid checkout request: cart is empty")

                quantities = {int(k): v for k, v in cart['quantities'].items()}
   ```

4. Change to:
   ```python
                quantities = {int(k): v for k, v in cart['quantities'].items()}
                if len(quantities) == 0:
                    raise Exception("Invalid checkout request: cart is empty")

   ```

5. Commit and push:
   ```bash
   git add flask/src/main.py
   git commit -m "fix: Move quantities assignment before usage in checkout endpoint

   Fixes MOBILE-REACT-NATIVE-4S"
   git push
   ```

## Testing the Fix

After applying:

1. Deploy the Flask backend to staging/production
2. Open the mobile app
3. Add items to cart
4. Tap "Submit Checkout"
5. Verify HTTP 200 response (not 500)
6. Check that no `UnboundLocalError` appears in logs

## Why This Fixes the Issue

The code was checking `len(quantities)` before `quantities` was defined, causing Python to raise `UnboundLocalError`. Moving the assignment before the check ensures the variable exists before it's used.

## Contact

If you need help applying this fix, refer to:
- Full documentation: `BACKEND_FIX_MOBILE-REACT-NATIVE-4S.md`
- Patch file: `BACKEND_FIX.patch`
- PR: https://github.com/sentry-demos/sentry_react_native/pull/128
