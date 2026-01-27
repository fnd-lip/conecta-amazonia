import './App.css';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import AppRoutes from './router/Router';
import { Toaster } from 'sonner';

function App() {
  return (
    <div className="flex flex-col min-h-screen justify-between">
      <Header />
      <Toaster richColors position="top-right" />
      <main>
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}

export default App;
