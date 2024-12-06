import { useNavigate } from 'react-router-dom';

export function useNavigation() {
  const navigate = useNavigate();

  return {
    toHome: () => navigate('/'),

    toAbout: () => navigate('/about'),
    toDashboard: () => navigate('/dashboard'),

    toProfile: () => navigate('/profile'),
    toSettings: () => navigate('/settings'),
    // account
    toLogin: () => navigate('/login'),
    toRegister: () => navigate('/register'),
    toReset: () => navigate('/reset-password'),
    //error
    toNotFound: () => navigate('error/404'),
    toNotAuthorized: () => navigate('error/403'),

    toCalibration: () => navigate('/calibrate'),
    toReadingPage: () => navigate('/reading'),
    
    
    toCustom: (path) => navigate(path), 
  };
}
