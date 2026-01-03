import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TradeDealerProvider } from './context/TradeDealerContext'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import UsedCarsPage from './pages/UsedCarsPage'
import NewCarsPage from './pages/NewCarsPage'
import SellYourCarPage from './pages/SellYourCarPage'
import CarAdvertisingPricesPage from './pages/CarAdvertisingPricesPage'
import AdvertPaymentSuccessPage from './pages/AdvertPaymentSuccessPage'
import CarFinderFormPage from './pages/CarFinderFormPage'
import CarValuationPage from './pages/CarValuationPage'

import VehicleLookupPage from './pages/VehicleLookupPage'
import VehicleCheckPage from './pages/VehicleCheckPage'
import VehicleDetailPage from './pages/VehicleDetailPage'
import VehiclePaymentPage from './pages/VehiclePaymentPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import SearchResultsPage from './pages/SearchResultsPage'
import SavedCarsPage from './pages/SavedCarsPage'
import ValuationPage from './pages/ValuationPage'
import ValuationResultsPage from './pages/ValuationResultsPage'
import VehicleValuationPage from './pages/VehicleValuationPage'
import CarAdvertEditPage from './pages/CarAdvertEditPage'
import SellerContactDetailsPage from './pages/SellerContactDetailsPage'
import CarDetailPage from './pages/CarDetailPage'
import SignInPage from './pages/SignInPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import CheckEmailPage from './pages/CheckEmailPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ContactPage from './pages/ContactPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

// Terms and Conditions Pages
import AdvertisingTermsPage from './pages/TermsAndConditions/AdvertisingTermsPage'

// Bike Pages
import BikesPage from './pages/Bikes/BikesPage'
import UsedBikesPage from './pages/Bikes/UsedBikesPage'
import NewBikesPage from './pages/Bikes/NewBikesPage'
import SellYourBikePage from './pages/Bikes/SellYourBikePage'
import BikeSearchResultsPage from './pages/Bikes/BikeSearchResultsPage'
import BikeDetailPage from './pages/Bikes/BikeDetailPage'
import BikeFinderFormPage from './pages/Bikes/BikeFinderFormPage'
import BikeAdvertEditPage from './pages/Bikes/BikeAdvertEditPage'
import BikeSellerContactPage from './pages/Bikes/BikeSellerContactPage'
import BikeAdvertisingPricesPage from './pages/Bikes/BikeAdvertisingPricesPage'
import BikeAdvertPaymentSuccessPage from './pages/Bikes/BikeAdvertPaymentSuccessPage'

// Van Pages
import VansPage from './pages/Vans/VansPage'
import UsedVansPage from './pages/Vans/UsedVansPage'
import NewVansPage from './pages/Vans/NewVansPage'
import SellYourVanPage from './pages/Vans/SellYourVanPage'
import VanFinderFormPage from './pages/Vans/VanFinderFormPage'
import VanAdvertEditPage from './pages/Vans/VanAdvertEditPage'
import VanSellerContactPage from './pages/Vans/VanSellerContactPage'
import VanAdvertisingPricesPage from './pages/Vans/VanAdvertisingPricesPage'
import VanAdvertPaymentSuccessPage from './pages/Vans/VanAdvertPaymentSuccessPage'
import VanDetailPage from './pages/Vans/VanDetailPage'
import VanSearchResultsPage from './pages/Vans/VanSearchResultsPage'

// Trade Dealer Pages
import TradeLoginPage from './pages/Trade/TradeLoginPage'
import TradeRegisterPage from './pages/Trade/TradeRegisterPage'
import TradeVerifyEmailPage from './pages/Trade/TradeVerifyEmailPage'
import TradeDashboard from './pages/Trade/TradeDashboard'
import TradeInventoryPage from './pages/Trade/TradeInventoryPage'
import TradeAnalyticsPage from './pages/Trade/TradeAnalyticsPage'
import TradeSubscriptionPage from './pages/Trade/TradeSubscriptionPage'
import TradeSubscriptionCheckoutPage from './pages/Trade/TradeSubscriptionCheckoutPage'
import TradeSubscriptionSuccessPage from './pages/Trade/TradeSubscriptionSuccessPage'
import ProtectedTradeRoute from './components/Trade/ProtectedTradeRoute'

import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <TradeDealerProvider>
          <div className="App">
            <Header />
            <main>
              <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/used-cars" element={<UsedCarsPage />} />
              <Route path="/new-cars" element={<NewCarsPage />} />
              <Route path="/sell-your-car" element={<SellYourCarPage />} />
              <Route path="/sell-my-car/advertising-prices" element={<CarAdvertisingPricesPage />} />
              <Route path="/advertising-prices" element={<CarAdvertisingPricesPage />} />
              <Route path="/sell-my-car/advert-payment-success" element={<AdvertPaymentSuccessPage />} />
              <Route path="/find-your-car" element={<CarFinderFormPage />} />
              <Route path="/car-valuation" element={<CarValuationPage />} />

              <Route path="/vehicle-lookup" element={<VehicleLookupPage />} />
              <Route path="/vehicle-check" element={<VehicleCheckPage />} />
              <Route path="/vehicle-detail/:registration" element={<VehicleDetailPage />} />
              <Route path="/vehicle-check/payment/:sessionId" element={<VehiclePaymentPage />} />
              <Route path="/vehicle-check/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/search-results" element={<SearchResultsPage />} />
              <Route path="/saved-cars" element={<SavedCarsPage />} />
              <Route path="/valuation" element={<ValuationPage />} />
              <Route path="/valuation/results" element={<ValuationResultsPage />} />
              <Route path="/valuation/vehicle" element={<VehicleValuationPage />} />
              <Route path="/selling/advert/edit/:advertId" element={<CarAdvertEditPage />} />
              <Route path="/selling/advert/contact/:advertId" element={<SellerContactDetailsPage />} />
              <Route path="/cars/:id" element={<CarDetailPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignInPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/check-email" element={<CheckEmailPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/contact" element={<ContactPage />} />
              
              {/* Terms and Conditions Routes */}
              <Route path="/terms-and-conditions/advertising" element={<AdvertisingTermsPage />} />
              
              {/* Bike Routes */}
              <Route path="/bikes" element={<BikesPage />} />
              <Route path="/bikes/used-bikes" element={<UsedBikesPage />} />
              <Route path="/bikes/new-bikes" element={<NewBikesPage />} />
              <Route path="/bikes/sell-your-bike" element={<SellYourBikePage />} />
              <Route path="/bikes/find-your-bike" element={<BikeFinderFormPage />} />
              <Route path="/bikes/selling/advert/edit/:advertId" element={<BikeAdvertEditPage />} />
              <Route path="/bikes/selling/advert/contact/:advertId" element={<BikeSellerContactPage />} />
              <Route path="/bikes/advertising-prices" element={<BikeAdvertisingPricesPage />} />
              <Route path="/bikes/advert-payment-success" element={<BikeAdvertPaymentSuccessPage />} />
              <Route path="/bikes/search-results" element={<BikeSearchResultsPage />} />
              <Route path="/bikes/:id" element={<BikeDetailPage />} />
              
              {/* Van Routes */}
              <Route path="/vans" element={<VansPage />} />
              <Route path="/vans/used-vans" element={<UsedVansPage />} />
              <Route path="/vans/new-vans" element={<NewVansPage />} />
              <Route path="/vans/sell-your-van" element={<SellYourVanPage />} />
              <Route path="/vans/find-your-van" element={<VanFinderFormPage />} />
              <Route path="/vans/selling/advert/edit/:advertId" element={<VanAdvertEditPage />} />
              <Route path="/vans/selling/advert/contact/:advertId" element={<VanSellerContactPage />} />
              <Route path="/vans/advertising-prices" element={<VanAdvertisingPricesPage />} />
              <Route path="/vans/advert-payment-success" element={<VanAdvertPaymentSuccessPage />} />
              <Route path="/vans/search-results" element={<VanSearchResultsPage />} />
              <Route path="/vans/:id" element={<VanDetailPage />} />
              
              {/* Trade Dealer Routes */}
              <Route path="/trade/login" element={<TradeLoginPage />} />
              <Route path="/trade/register" element={<TradeRegisterPage />} />
              <Route path="/trade/verify-email" element={<TradeVerifyEmailPage />} />
              <Route 
                path="/trade/dashboard" 
                element={
                  <ProtectedTradeRoute>
                    <TradeDashboard />
                  </ProtectedTradeRoute>
                } 
              />
              <Route 
                path="/trade/inventory" 
                element={
                  <ProtectedTradeRoute>
                    <TradeInventoryPage />
                  </ProtectedTradeRoute>
                } 
              />
              <Route 
                path="/trade/analytics" 
                element={
                  <ProtectedTradeRoute>
                    <TradeAnalyticsPage />
                  </ProtectedTradeRoute>
                } 
              />
              <Route 
                path="/trade/subscription" 
                element={
                  <ProtectedTradeRoute>
                    <TradeSubscriptionPage />
                  </ProtectedTradeRoute>
                } 
              />
              <Route 
                path="/trade/subscription/checkout/:planSlug" 
                element={
                  <ProtectedTradeRoute>
                    <TradeSubscriptionCheckoutPage />
                  </ProtectedTradeRoute>
                } 
              />
              <Route 
                path="/trade/subscription/success" 
                element={<TradeSubscriptionSuccessPage />}
              />
            </Routes>
          </main>
          <Footer />
        </div>
        </TradeDealerProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
