import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import daisyui from "daisyui";


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()
    ,tailwindcss(),
    daisyui,
  ],
 
server: {
    proxy: {
      '/print-candidates': 'http://localhost:5000',
      '/print-jobs': 'http://localhost:5000',
      '/print-drives': 'http://localhost:5000',
      '/candidate': 'http://localhost:5000',
      '/candidate/bulk': 'http://localhost:5000',

      '/print-panelists': 'http://localhost:5000',
      '/panelist': 'http://localhost:5000',

      '/job' : 'http://localhost:5000',
      '/drive' : 'http://localhost:5000',

      '/Users' : 'http://localhost:5000',
    },
  },
})
