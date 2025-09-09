import MerchantBazaar from "./MerchantBazaar";

export default function App() {
  return (
    <div className="min-h-screen bg-amber-50">
      <MerchantBazaar apiUrl="https://karolkrych.pythonanywhere.com/" />
    </div>
  );
}
