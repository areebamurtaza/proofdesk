// filepath: src/components/canvas/PinMarker.tsx
"use client";

import React from "react";
import { Group, Circle, Text as KonvaText } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { CommentItem } from "@/types/review";

interface PinMarkerProps {
  comment: CommentItem;
  index: number;
  x: number;
  y: number;
  isSelected: boolean;
  onClick: () => void;
}

export function PinMarker({
  comment,
  index,
  x,
  y,
  isSelected,
  onClick,
}: PinMarkerProps) {
  const isResolved = comment.isResolved;
  const fillColor = isResolved ? "#2F6B4F" : isSelected ? "#D7C3A5" : "#172B4D";
  const strokeColor = isSelected ? "#0B1628" : "#ffffff";
  const textColor = isResolved ? "#ffffff" : isSelected ? "#0B1628" : "#ffffff";

  // Prevent event from bubbling up to Stage and dropping a new pin
  const handleClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    onClick();
  };

  return (
    <Group
      x={x}
      y={y}
      onClick={handleClick}
      onTap={handleClick}
      listening={true}
    >
      {/* Outer Pulse / Selection Halo */}
      {isSelected && (
        <Circle radius={20} fill="#D7C3A5" opacity={0.4} listening={false} />
      )}

      {/* Main Pin Body */}
      <Circle
        radius={14}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
        shadowColor="#000000"
        shadowBlur={6}
        shadowOpacity={0.4}
        shadowOffset={{ x: 0, y: 3 }}
      />

      {/* Pin Number Label */}
      <KonvaText
        text={String(index + 1)}
        fontSize={11}
        fontFamily="sans-serif"
        fontStyle="bold"
        fill={textColor}
        align="center"
        verticalAlign="middle"
        offsetX={index + 1 >= 10 ? 6 : 4}
        offsetY={5}
        listening={false}
      />
    </Group>
  );
}