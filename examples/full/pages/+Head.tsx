export { Head }

import React from 'react'
import logoUrl from '../assets/logo.svg'

function Head() {
  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href={logoUrl} />
    </>
  )
}
