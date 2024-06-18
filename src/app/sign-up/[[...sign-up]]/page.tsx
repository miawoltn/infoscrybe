'use client'
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { SignUp, useSignUp } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function Page() {
    const {isLoaded} = useSignUp();
    useEffect(() => {
      let timer = null;
      if(isLoaded) {
      timer = setTimeout(() => { 
      const clerkBanner = document.querySelector<HTMLElement>('.cl-internal-b3fm6y')!;
        if (clerkBanner) {
          clerkBanner.parentElement?.removeChild(clerkBanner);
        }
      }, 20)
      }
  
      return () => clearInterval(timer!);
    }, [isLoaded])
    return (
        <MaxWidthWrapper className='mb-12 mt-10 sm:mt-20 flex flex-col items-center justify-center text-center'>
        {isLoaded ?  <SignUp /> : <Loader2 className="animate-spin items-center mt-20 w-10 h-10" />}
        </MaxWidthWrapper>
    )
}