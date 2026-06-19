import { useNavigate, useParams } from 'react-router-dom'
import StoreDetailModal from '../components/StoreDetailModal'

function StoreDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <StoreDetailModal open storeId={id} onClose={() => navigate('/stores', { replace: true })} />
  )
}

export default StoreDetail
