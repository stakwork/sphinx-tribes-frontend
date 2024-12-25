import React from "react"

export const BountiesLandingPage = () => (
    <div className="min-h-screen bg-gray-50 grid grid-rows-[auto,1fr]">
      <header className="border-b bg-white">
        <div className="mx-auto px-4 py-4 max-w-screen-xl">
          <h1 className="text-4xl font-bold">Bounties</h1>
        </div>
      </header>
      
      <main className="mx-auto px-4 py-8 grid">
        <div className="rounded-lg bg-white p-12 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-16rem)]">
          <div className="lg:col-span-2 space-y-4 lg:border-r lg:pr-10 sm:py-2 md:py-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome to Bounties</h2>
            <p className="text-lg text-gray-600">
              Building the modern marketplace for work. Complete a bounty and get paid in Bitcoin instantly! ⚡
            </p>
          </div>
          
          <div className="space-y-4 lg:pl-8">
            <h2 className="text-2xl font-bold">Freedom to Earn!</h2>
            <p className="text-gray-600">
              Second column with content
            </p>
          </div>
        </div>
      </main>
    </div>
)