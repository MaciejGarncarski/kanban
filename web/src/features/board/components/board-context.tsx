import { createContext, ReactNode, useContext, useState } from 'react'

type BoardContextType = {
  isDraggingColumn: boolean
  setIsDraggingColumn: (isDragging: boolean) => void
  isDraggingCard: boolean
  setIsDraggingCard: (isDragging: boolean) => void
}

export const BoardContext = createContext<BoardContextType | undefined>(
  undefined,
)

export const BoardProvider = ({
  children,
}: {
  readonly children: ReactNode
}) => {
  const [isDraggingColumn, setIsDraggingColumn] = useState(false)
  const [isDraggingCard, setIsDraggingCard] = useState(false)

  return (
    <BoardContext.Provider
      value={{
        isDraggingColumn,
        setIsDraggingColumn,
        isDraggingCard,
        setIsDraggingCard,
      }}>
      {children}
    </BoardContext.Provider>
  )
}

export const useBoardContext = () => {
  const context = useContext(BoardContext)
  if (context === undefined) {
    throw new Error(
      `useContext must be used inside a Provider with a value that's not undefined`,
    )
  }
  return context
}
