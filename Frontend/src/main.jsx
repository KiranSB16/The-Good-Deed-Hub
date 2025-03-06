import { createRoot } from 'react-dom/client';
import store from './store';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import './index.css';

console.log('store', store.getState());

const router = createBrowserRouter([
  {
    path: '/*',
    element: (
      <Provider store={store}>
        <App />
      </Provider>
    )
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);