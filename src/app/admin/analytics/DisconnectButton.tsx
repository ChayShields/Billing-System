"use client"

import { useTransition } from "react"
import { disconnectGoogleAnalytics } from "./actions"
import { buttonClasses } from "@/components/ui/Button"

export default function DisconnectButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => disconnectGoogleAnalytics())}
      className={buttonClasses("danger")}
    >
      Disconnect
    </button>
  )
}
