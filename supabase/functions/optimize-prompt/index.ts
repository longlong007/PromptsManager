// AI prompt optimization Edge Function
// The frontend AI key setting has been removed; this function is intentionally disabled.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  return new Response(
    JSON.stringify({ error: 'AI optimization has been removed' }),
    { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
