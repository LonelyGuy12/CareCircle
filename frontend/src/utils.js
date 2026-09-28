export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })

export const statusStyle = {
  taken: { label: 'Taken', className: 'bg-green-100 text-green-800' },
  missed: { label: 'Missed', className: 'bg-red-100 text-red-800' },
  pending: { label: 'Upcoming', className: 'bg-amber-100 text-amber-800' },
}
