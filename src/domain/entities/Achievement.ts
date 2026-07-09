export interface Achievement {
  id: string
  userId: string
  eventName: string
  eventDate: string
  location?: string
  distance?: string
  category?: string
  overallPosition?: string
  categoryPosition?: string
  grossTime?: string
  netTime?: string
  thumbnailBase64?: string
  createdAt: Date
  updatedAt: Date
}
