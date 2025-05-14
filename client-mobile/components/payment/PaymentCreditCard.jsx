import { StripeProvider } from "@stripe/stripe-react-native";

import {EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY} from '@env';

const BookRide = () => {
  

  return (
    <StripeProvider
      publishableKey={EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.uber"
      urlScheme="myapp"
    >
        <>
          <Payment
            fullName={'demoTest'}
            email={'123@123'}
            amount={'driverDetails?.price!'}
            driverId={'id123'}
            rideTime={'123'}
          />
        </>
    </StripeProvider>
  );
};

export default BookRide;
