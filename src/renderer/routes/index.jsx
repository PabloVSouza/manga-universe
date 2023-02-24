import { Route, Routes, Navigate } from 'react-router-dom'

import Home from '../pages/Home'

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route path="/*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  )
}

export default Router
