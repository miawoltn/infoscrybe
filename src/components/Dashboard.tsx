'use client'

// import { trpc } from '@/app/_trpc/client'
import {
  FileText,
  Ghost,
  Loader2,
  MessageSquare,
  Plus,
  Trash,
} from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from './ui/button'
import { useState } from 'react'
// import { getUserSubscriptionPlan } from '@/lib/stripe'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
// import { DrizzleChat } from '@/lib/db'
import FileUpload from './FileUpload'
import { getUserSubscriptionPlan } from '@/lib/stripe'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'

interface PageProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

const Dashboard = ({ subscriptionPlan }: PageProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentlyDeletingFile, setCurrentlyDeletingFile] =
    useState<string | null>(null)

  const { data: files, isLoading } = useQuery({
    queryKey: [''],
    queryFn: async () => (await axios.get<any[]>('/api/chat')).data
  });


  const { mutate: deleteFile } = useMutation({
    onSuccess: () => {
      // utils.getUserFiles.invalidate()
    },
    onMutate({ id }: { id: any }) {
      setCurrentlyDeletingFile(id)
    },
    onSettled() {
      setCurrentlyDeletingFile(null)
    },
  })

  if (isLoading) {
    return (
      <div className="grid h-screen w-screen place-items-center">
        <Loader2 className='w-6 h-6 animate-spin' />
      </div>
    )
  }

  return (
    <main className='mx-auto max-w-7xl md:p-10 w-full'>
      <div className='mt-0 flex flex-col items-center justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0'>
        <h3 className='mb-3 font-bold text-5xl text-gray-900'>
          My Files
        </h3>

        <Dialog
          open={isOpen}
          onOpenChange={(v) => {
            if (!v) {
              setIsOpen(v)
            }
          }}>
          <DialogTrigger
            onClick={() => setIsOpen(true)}
            asChild>
            <Button>Upload PDF</Button>
          </DialogTrigger>

          <DialogContent>
            <div className="w-full">
              <FileUpload isSubscribed={subscriptionPlan.isSubscribed} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* display all user files */}
      {files && files?.length !== 0 ? (
        <ul className='mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3'>
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((file) => (
              <li
                key={file.id}
                className='col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg'>
                <Link
                  href={`/chat/${file.id}`}
                  className='flex flex-col gap-2'>
                  <div className='pt-6 px-6 flex w-full items-center justify-between space-x-6'>
                    {/* <div className='h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500' /> */}
                    <FileText />
                    <div className='flex-1 truncate'>
                      <div className='flex items-center space-x-3'>
                        <h3 className='truncate text-lg font-medium text-zinc-900'>
                          {file.pdfName}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className='px-5 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500'>
                  <div className='flex items-center gap-2'>
                    <Plus className='h-4 w-4' />
                    {format(
                      new Date(file.createdAt),
                      'MMM yyyy'
                    )}
                  </div>

                  <div className='flex items-center gap-2'>
                    <MessageSquare className='h-4 w-4' />
                    {file.messages.length}
                  </div>

                  <Button
                    onClick={() =>
                      deleteFile({ id: file.id })
                    }
                    size='sm'
                    className='w-full hidden'
                    variant='destructive'>
                    <Trash className='h-4 w-4' />
                    {/* {currentlyDeletingFile == file.id+"" ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Trash className='h-4 w-4' />
                    )} */}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <Skeleton height={100} className='my-2' count={3} />
      ) : (
        <div className='mt-16 flex flex-col items-center gap-2'>
          <Ghost className='h-8 w-8 text-zinc-800' />
          <h3 className='font-semibold text-xl'>
            Pretty empty around here
          </h3>
          <p>Let&apos;s upload your first PDF.</p>
        </div>
      )}
    </main>
  )
}

export default Dashboard