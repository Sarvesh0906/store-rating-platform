import { useNavigate, useParams } from 'react-router-dom'
import StoreRatingModal from '../components/StoreRatingModal'

function StoreEditRating() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <StoreRatingModal
      open
      storeId={id}
      mode="edit"
      onClose={() => navigate('/stores', { replace: true })}
      onSuccess={() => navigate('/stores', { replace: true })}
    />
  )
}

export default StoreEditRating
