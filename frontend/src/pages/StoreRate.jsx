import { useNavigate, useParams } from 'react-router-dom'
import StoreRatingModal from '../components/StoreRatingModal'

function StoreRate() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <StoreRatingModal
      open
      storeId={id}
      mode="submit"
      onClose={() => navigate('/stores', { replace: true })}
      onSuccess={() => navigate('/stores', { replace: true })}
    />
  )
}

export default StoreRate
