import React, { useState, useEffect, useCallback } from 'react';
import { Product, User } from './types';
import { INITIAL_PRODUCTS } from './data/products';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SubmitPage } from './pages/SubmitPage';
import { PricingPage } from './pages/PricingPage';
import { AboutPage } from './pages/AboutPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { GoRedirectPage } from './pages/GoRedirectPage';
import { productService } from './services/productService';
import { authService } from './services/authService';
import { isSupabaseConfigured } from './lib/supabase';

export function App() {
  // Products state (populated from Supabase or initial seed)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(isSupabaseConfigured);

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('visorank_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Routing State
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);

  // Search & category filters shared with HomePage / Explore
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');

  // Click Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load products from Supabase on mount
  const refreshProducts = useCallback(async () => {
    try {
      const res = await productService.fetchProducts({ includePending: true });
      if (res.products && res.products.length > 0) {
        setProducts(res.products);
        setIsSupabaseLive(res.isFromSupabase);
      }
    } catch (e) {
      console.error('Error loading products from Supabase:', e);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  // Sync Supabase Auth state changes
  useEffect(() => {
    const { unsubscribe } = authService.onAuthStateChange(user => {
      if (user) {
        setCurrentUser(user);
        try {
          localStorage.setItem('visorank_user', JSON.stringify(user));
        } catch {}
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Parse path or hash on load (supporting /go/:slug)
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname;
      const hash = window.location.hash.replace(/^#/, '');

      if (path.startsWith('/go/')) {
        const slug = path.replace('/go/', '').split('/')[0];
        if (slug) {
          setSelectedProductSlug(slug);
          setCurrentPage('go');
          return;
        }
      }

      if (hash.startsWith('go/')) {
        const slug = hash.replace('go/', '').split('/')[0];
        if (slug) {
          setSelectedProductSlug(slug);
          setCurrentPage('go');
          return;
        }
      }

      const params = new URLSearchParams(window.location.search);
      const goSlug = params.get('go');
      if (goSlug) {
        setSelectedProductSlug(goSlug);
        setCurrentPage('go');
      }
    };

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, []);

  // Save current user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('visorank_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('visorank_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Navigation helper
  const navigateTo = (page: string, param?: string) => {
    setCurrentPage(page);
    if (page === 'product' && param) {
      setSelectedProductSlug(param);
    }
    if (page === 'go' && param) {
      setSelectedProductSlug(param);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Click tracking and Visit external product
  const handleVisitProduct = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();

    // Optimistically update local click count & rank
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === product.id) {
          return { ...p, clicks: p.clicks + 1 };
        }
        return p;
      });
      return updated.sort((a, b) => b.clicks - a.clicks).map((p, idx) => ({ ...p, rank: idx + 1 }));
    });

    setToastMessage(`Tracking verified click to ${product.name}...`);
    setTimeout(() => setToastMessage(null), 3000);

    // Call Supabase telemetry click tracking in the background
    productService.recordClick(product.slug, document.referrer).catch(() => {});

    // Open target website in new tab
    window.open(product.websiteUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProductSlug(product.slug);
    setCurrentPage('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNewProduct = (newProdData: Omit<Product, 'id' | 'clicks' | 'rank' | 'createdAt'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: 'prod_' + Date.now(),
      clicks: newProdData.tier === 'Boost' ? 120 : newProdData.tier === 'Featured' ? 280 : newProdData.tier === 'Premium' ? 540 : 12,
      rank: products.length + 1,
      createdAt: Date.now()
    };

    setProducts(prev => {
      const combined = [newProduct, ...prev];
      return combined.sort((a, b) => b.clicks - a.clicks).map((p, idx) => ({ ...p, rank: idx + 1 }));
    });

    refreshProducts();
  };

  const handleLogout = async () => {
    await authService.signOut();
    setCurrentUser(null);
  };

  const currentSelectedProduct = products.find(p => p.slug === selectedProductSlug) || products[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 100,
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '14px',
          fontWeight: 600,
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🚀</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Persistent Global Web Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Page Content */}
      <div style={{ flex: 1 }}>
        {currentPage === 'home' && (
          <HomePage
            products={products}
            onSelectProduct={handleSelectProduct}
            onVisitProduct={handleVisitProduct}
            onNavigate={navigateTo}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}

        {currentPage === 'explore' && (
          <ExplorePage
            products={products}
            onSelectProduct={handleSelectProduct}
            onVisitProduct={handleVisitProduct}
            initialCategory={selectedCategory}
          />
        )}

        {currentPage === 'leaderboard' && (
          <LeaderboardPage
            products={products}
            onSelectProduct={handleSelectProduct}
            onVisitProduct={handleVisitProduct}
          />
        )}

        {currentPage === 'categories' && (
          <CategoriesPage
            products={products}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setCurrentPage('explore');
            }}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'product' && currentSelectedProduct && (
          <ProductDetailPage
            product={currentSelectedProduct}
            allProducts={products}
            currentUser={currentUser}
            onBack={() => navigateTo('home')}
            onVisit={handleVisitProduct}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'go' && selectedProductSlug && (
          <GoRedirectPage
            slug={selectedProductSlug}
            allProducts={products}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'submit' && (
          <SubmitPage
            onSubmitProduct={handleAddNewProduct}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'pricing' && (
          <PricingPage onNavigate={navigateTo} />
        )}

        {currentPage === 'about' && (
          <AboutPage />
        )}

        {currentPage === 'login' && (
          <AuthPage
            mode="login"
            onSuccess={(u) => {
              setCurrentUser(u);
              navigateTo('dashboard');
            }}
            onSwitchMode={(mode) => navigateTo(mode)}
          />
        )}

        {currentPage === 'signup' && (
          <AuthPage
            mode="signup"
            onSuccess={(u) => {
              setCurrentUser(u);
              navigateTo('dashboard');
            }}
            onSwitchMode={(mode) => navigateTo(mode)}
          />
        )}

        {currentPage === 'dashboard' && (
          <DashboardPage
            currentUser={currentUser}
            products={products}
            onNavigate={navigateTo}
            onPromote={(p) => {
              setSelectedProductSlug(p.slug);
              navigateTo('pricing');
            }}
            onRefreshProducts={refreshProducts}
          />
        )}
      </div>

      {/* Persistent Global Web Footer */}
      <Footer onNavigate={navigateTo} />

    </div>
  );
}
