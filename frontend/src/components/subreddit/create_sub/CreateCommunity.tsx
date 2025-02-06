'use client'

import { useEffect } from "react"
import CreateSubForm from "./CreateSubForm";
import { useAuth } from "@/components/context/AuthContext";
import { useRouter } from "next/navigation";


const CreateSub = () => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated]);
  
  if (loading || !isAuthenticated) {
    return <h1 className="text-white">loading</h1>
  }

  return (
    <div className="max-w-2xl mx-auto text-white p-8 rounded-md shadow-sm">
      <h1 className="text-xl font-semibold mb-4">Create Community</h1>
        <CreateSubForm/>
    </div>
    
  )

}

export default CreateSub;
