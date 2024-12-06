import { useNavigate } from 'react-router-dom';

export function useNavigation() {
  const navigate = useNavigate();

  return {
    // homepage
    toHome: () => navigate('/'),
    
    // products
    toAbout: () => navigate('/about'),

    // account menu
    toDashboard: () => navigate('/account/dashboard'),
    toProfile: () => navigate('/account/profile'),
    toSettings: () => navigate('/account/settings'),
    
    // registration tab
    toLogin: () => navigate('/login'),
    toRegister: () => navigate('/register'),
    toReset: () => navigate('/reset-password'),

    // utils
    toTimeOut: () => navigate('/timeout'),
    toNotFound: () => navigate('/not-found'),
    
  };
}
