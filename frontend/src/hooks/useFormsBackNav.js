import { useLocation } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';

export function useFormsBackNav() {
  const location = useLocation();
  const { goToHR, goToJobListings } = useNavigation();
  return location.pathname.startsWith('/workspace') ? goToJobListings : goToHR;
}