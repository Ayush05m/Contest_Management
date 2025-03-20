import { useAppSelector } from "@/lib/redux/store"

export const useAuth = () => {
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth)

  return {
    user,
    isAuthenticated,
    loading,
  }
}

