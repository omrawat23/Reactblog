import { useRecoilValue } from 'recoil';
import { authState } from './authState'; 

const useAuth = () => {
  const { user } = useRecoilValue(authState);
  return user?.uid; // Returns user.uid or undefined if not authenticated
};

export default useAuth;
