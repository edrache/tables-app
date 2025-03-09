import { Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/layout/Layout'
import HomePage from './components/pages/HomePage'
import TableEditor from './components/tables/TableEditor'
import TableList from './components/tables/TableList'
import PageBuilder from './components/pages/PageBuilder'
import PageList from './components/pages/PageList'
import PageView from './components/pages/PageView'
import AuthPage from './components/auth/AuthPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tables" element={<TableList />} />
          <Route path="/table/new" element={<TableEditor />} />
          <Route path="/table/:id" element={<TableEditor />} />
          <Route path="/pages" element={<PageList />} />
          <Route path="/page/new" element={<PageBuilder />} />
          <Route path="/page/:slug" element={<PageView />} />
          <Route path="/page/:slug/edit" element={<PageBuilder />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </Layout>
    </QueryClientProvider>
  )
}

export default App 