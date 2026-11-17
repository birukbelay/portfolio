// Chess pieces used on the experience timeline (shared by server and client components).
export type Piece = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";

export const PIECE_GLYPH: Record<Piece, string> = {
  pawn: "♟",
  knight: "♞",
  bishop: "♝",
  rook: "♜",
  queen: "♛",
  king: "♚",
};

// Career as a chess promotion: the earliest role is a pawn, the current role is the king.
const PROMOTION: Piece[] = ["pawn", "knight", "bishop", "rook", "queen"];
export const pieceFor = (index: number, total: number): Piece =>
  index === 0 ? "king" : PROMOTION[Math.min(total - 1 - index, PROMOTION.length - 1)];
