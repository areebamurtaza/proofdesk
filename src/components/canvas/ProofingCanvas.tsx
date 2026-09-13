// filepath: src/components/canvas/ProofingCanvas.tsx
"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Text, Group, Circle, Line } from "react-konva";
import useImage from "use-image";
import { VersionItem, CommentItem } from "@/types/review";
import Konva from "konva";
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ArrowLeftRight, 
  SplitSquareHorizontal,
  Layers
} from "lucide-react";

interface ProofingCanvasProps {
  version: VersionItem; // Active version currently open in review
  compareVersion?: VersionItem;
  allVersions?: VersionItem[]; // Full version history
  isCompareMode: boolean;
  isUnlocked: boolean;
  showPins: boolean;
  isPinModeActive: boolean;
  selectedCommentId: string | null;
  pendingPin: { xPercent: number; yPercent: number } | null;
  onSelectComment: (id: string | null) => void;
  onAddCommentPin: (xPercent: number, yPercent: number) => void;
  onSelectCompareVersion?: (version: VersionItem) => void;
}

export default function ProofingCanvas({
  version,
  compareVersion,
  allVersions = [],
  isCompareMode,
  isUnlocked,
  showPins,
  isPinModeActive,
  selectedCommentId,
  pendingPin,
  onSelectComment,
  onAddCommentPin,
  onSelectCompareVersion,
}: ProofingCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  // 1. Filter out the currently viewed version so it cannot be selected against itself
  const candidateVersions = useMemo(() => {
    return allVersions
      .filter((v) => v.id !== version.id)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  }, [allVersions, version.id]);

  // 2. Resolve default comparison target:
  // Prefer immediate predecessor (e.g., if on v2, pick v1; if on v3, pick v2)
  const defaultCandidate = useMemo(() => {
    if (candidateVersions.length === 0) return null;
    const predecessor = candidateVersions.find((v) => v.versionNumber < version.versionNumber);
    return predecessor || candidateVersions[0];
  }, [candidateVersions, version.versionNumber]);

  // Comparison target selection state
  const [selectedCompareId, setSelectedCompareId] = useState<string>(
    compareVersion?.id && compareVersion.id !== version.id
      ? compareVersion.id
      : defaultCandidate?.id || ""
  );

  // Swap flag: false = [Compare (Left) | Current (Right)], true = [Current (Left) | Compare (Right)]
  const [isSwapped, setIsSwapped] = useState<boolean>(false);

  // Synchronize when the user changes active version from tabs
  useEffect(() => {
    if (defaultCandidate && (!selectedCompareId || selectedCompareId === version.id)) {
      setSelectedCompareId(defaultCandidate.id);
      onSelectCompareVersion?.(defaultCandidate);
    }
  }, [version.id, defaultCandidate, selectedCompareId, onSelectCompareVersion]);

  // Resolved comparison asset
  const activeCompareVersion = useMemo(() => {
    return candidateVersions.find((v) => v.id === selectedCompareId) || defaultCandidate;
  }, [candidateVersions, selectedCompareId, defaultCandidate]);

  // Load Primary (Current) & Secondary (Compared) Images
  const [imageCurrent] = useImage(version.previewUrl, "anonymous");
  const [imageCompare] = useImage(activeCompareVersion?.previewUrl || "", "anonymous");

  // Determine which asset is on the Left vs Right side of the divider
  const leftImage = isSwapped ? imageCurrent : imageCompare;
  const rightImage = isSwapped ? imageCompare : imageCurrent;
  const leftLabel = isSwapped ? `v${version.versionNumber} (Current)` : `v${activeCompareVersion?.versionNumber || "?"}`;
  const rightLabel = isSwapped ? `v${activeCompareVersion?.versionNumber || "?"}` : `v${version.versionNumber} (Current)`;

  // Viewport Container Dimensions
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 600 });

  // Transform Matrix (Pan & Zoom)
  const [stageScale, setStageScale] = useState<number>(1.0);
  const [stagePos, setStagePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);

  // Compare Slider State (Tracked in native image pixel coordinates)
  const [compareSplitX, setCompareSplitX] = useState<number>(600);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);

  const naturalWidth = imageCurrent?.naturalWidth || imageCurrent?.width || 1200;
  const naturalHeight = imageCurrent?.naturalHeight || imageCurrent?.height || 800;

  // Track container sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      setContainerDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Fit Image into Viewport
  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current || !imageCurrent) return;

    const availableWidth = containerRef.current.offsetWidth - 64;
    const availableHeight = containerRef.current.offsetHeight - 64;

    const scale = Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight, 1.0);
    const initialX = (containerRef.current.offsetWidth - naturalWidth * scale) / 2;
    const initialY = (containerRef.current.offsetHeight - naturalHeight * scale) / 2;

    setStageScale(scale);
    setStagePos({ x: initialX, y: initialY });
    setCompareSplitX(naturalWidth / 2);
  }, [imageCurrent, naturalWidth, naturalHeight]);

  useEffect(() => {
    if (imageCurrent) {
      handleFitToScreen();
    }
  }, [imageCurrent, handleFitToScreen]);

  // Spacebar pan navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !e.repeat &&
        (e.target as HTMLElement).tagName !== "INPUT" &&
        (e.target as HTMLElement).tagName !== "TEXTAREA" &&
        (e.target as HTMLElement).tagName !== "SELECT"
      ) {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Zoom Handling
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };

    const scaleFactor = 1.12;
    let newScale = e.evt.deltaY < 0 ? oldScale * scaleFactor : oldScale / scaleFactor;
    newScale = Math.max(0.05, Math.min(5.0, newScale));

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setStageScale(newScale);
    setStagePos(newPos);
  };

  const handleManualZoom = (delta: number) => {
    if (!stageRef.current) return;
    const oldScale = stageScale;
    const newScale = Math.max(0.05, Math.min(5.0, oldScale + delta));

    const centerX = containerDimensions.width / 2;
    const centerY = containerDimensions.height / 2;

    const mousePointTo = {
      x: (centerX - stagePos.x) / oldScale,
      y: (centerY - stagePos.y) / oldScale,
    };

    setStageScale(newScale);
    setStagePos({
      x: centerX - mousePointTo.x * newScale,
      y: centerY - mousePointTo.y * newScale,
    });
  };

  const handleResetTo100Percent = () => {
    const centerX = containerDimensions.width / 2;
    const centerY = containerDimensions.height / 2;
    setStageScale(1.0);
    setStagePos({
      x: centerX - naturalWidth / 2,
      y: centerY - naturalHeight / 2,
    });
  };

  // Pin Placement Handling
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isPinModeActive || isUnlocked || isSpacePressed || isDraggingCanvas || isDraggingSlider) return;

    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const nativeX = (pointer.x - stagePos.x) / stageScale;
    const nativeY = (pointer.y - stagePos.y) / stageScale;

    if (nativeX < 0 || nativeX > naturalWidth || nativeY < 0 || nativeY > naturalHeight) {
      return;
    }

    const xPercent = Number((nativeX / naturalWidth).toFixed(4));
    const yPercent = Number((nativeY / naturalHeight).toFixed(4));

    onAddCommentPin(xPercent, yPercent);
  };

  const handleSliderDrag = (e: Konva.KonvaEventObject<DragEvent>) => {
    const newX = e.target.x();
    setCompareSplitX(Math.max(0, Math.min(newX, naturalWidth)));
  };

  // Dropdown Change: User switches which other version to compare with
  const handleTargetSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextId = e.target.value;
    setSelectedCompareId(nextId);
    const target = candidateVersions.find((v) => v.id === nextId);
    if (target) {
      onSelectCompareVersion?.(target);
    }
  };

  // Render Watermark
  const renderWatermark = () => {
    if (isUnlocked) return null;

    const diagonal = Math.sqrt(naturalWidth * naturalWidth + naturalHeight * naturalHeight);
    const angle = -28;

    const primaryFontSize = Math.max(16, Math.min(32, naturalWidth * 0.022));
    const secondaryFontSize = Math.max(14, Math.min(26, naturalWidth * 0.018));

    return (
      <Group
        clipFunc={(ctx) => {
          ctx.rect(0, 0, naturalWidth, naturalHeight);
        }}
        listening={false}
      >
        <Group x={naturalWidth * 0.5} y={naturalHeight * 0.35} rotation={angle}>
          <Text
            text="PROOFDESK PREVIEW • UNPAID DRAFT"
            fontSize={primaryFontSize}
            fontFamily="monospace"
            fontStyle="bold"
            letterSpacing={4}
            fill="rgba(255, 255, 255, 0.28)"
            stroke="rgba(0, 0, 0, 0.35)"
            strokeWidth={1}
            offsetX={diagonal * 0.28}
            offsetY={primaryFontSize / 2}
            listening={false}
          />
        </Group>

        <Group x={naturalWidth * 0.5} y={naturalHeight * 0.68} rotation={angle}>
          <Text
            text="CONFIDENTIAL • PENDING FINAL APPROVAL"
            fontSize={secondaryFontSize}
            fontFamily="monospace"
            fontStyle="bold"
            letterSpacing={4}
            fill="rgba(255, 255, 255, 0.28)"
            stroke="rgba(0, 0, 0, 0.35)"
            strokeWidth={1}
            offsetX={diagonal * 0.28}
            offsetY={secondaryFontSize / 2}
            listening={false}
          />
        </Group>

        <Group x={16} y={Math.max(16, naturalHeight - 36)}>
          <Rect
            width={210}
            height={24}
            fill="rgba(0, 0, 0, 0.55)"
            cornerRadius={4}
          />
          <Text
            x={10}
            y={6}
            text="PROTECTED BY PROOFDESK ESCROW"
            fontSize={9}
            fontFamily="monospace"
            fontStyle="bold"
            fill="rgba(255, 255, 255, 0.7)"
            listening={false}
          />
        </Group>
      </Group>
    );
  };

  const isPanActive = isSpacePressed || (!isPinModeActive && !isCompareMode);
  const cursorStyle = isDraggingCanvas
    ? "cursor-grabbing"
    : isPanActive
    ? "cursor-grab"
    : isPinModeActive
    ? "cursor-crosshair"
    : "cursor-default";

  const splitPercentage = Math.round((compareSplitX / naturalWidth) * 100);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden bg-zinc-950 flex items-center justify-center select-none ${cursorStyle}`}
    >
      {/* ============================================================ */}
      {/* DYNAMIC COMPARISON HUD (Current Version Anchored)             */}
      {/* ============================================================ */}
      {isCompareMode && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 p-1.5 px-3 rounded-2xl bg-zinc-950/95 border border-zinc-800 backdrop-blur-md shadow-2xl text-xs">
          {/* Active Version Badge (Locked to the version you are viewing) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700/80">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Current
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              v{version.versionNumber}
            </span>
          </div>

          <span className="text-zinc-600 font-bold">vs</span>

          {/* Filtered Comparison Selector: ONLY lists the OTHER versions */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Compare with
            </span>
            {candidateVersions.length > 0 ? (
              <select
                value={selectedCompareId}
                onChange={handleTargetSelection}
                className="bg-zinc-900 border border-indigo-500/50 text-indigo-200 text-xs rounded-lg px-2.5 py-1 outline-none focus:border-indigo-400 font-mono transition-colors cursor-pointer"
              >
                {candidateVersions.map((v) => (
                  <option key={`compare-opt-${v.id}`} value={v.id}>
                    v{v.versionNumber} ({v.fileName.length > 16 ? `${v.fileName.substring(0, 13)}...` : v.fileName})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-zinc-500 italic text-[11px]">No other versions</span>
            )}
          </div>

          {/* Swap Split Sides Button */}
          {candidateVersions.length > 0 && (
            <button
              onClick={() => setIsSwapped((prev) => !prev)}
              title={`Flip Layout (Currently: Left = ${leftLabel}, Right = ${rightLabel})`}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all active:scale-95"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="h-4 w-px bg-zinc-800 mx-1" />

          {/* Split Percentage Meter */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
            <SplitSquareHorizontal className="w-3.5 h-3.5 text-zinc-500" />
            <span>{splitPercentage}%</span>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* KONVA STAGE CONTAINER                                        */}
      {/* ============================================================ */}
      <Stage
        ref={stageRef}
        width={containerDimensions.width}
        height={containerDimensions.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        onWheel={handleWheel}
        draggable={isPanActive}
        onDragStart={() => setIsDraggingCanvas(true)}
        onDragEnd={(e) => {
          setIsDraggingCanvas(false);
          if (e.target === stageRef.current) {
            setStagePos(e.target.position());
          }
        }}
        onClick={handleStageClick}
      >
        <Layer>
          {/* Card Border & Drop Shadow */}
          <Rect
            x={-1}
            y={-1}
            width={naturalWidth + 2}
            height={naturalHeight + 2}
            fill="#18181b"
            stroke="#27272a"
            strokeWidth={1 / stageScale}
            shadowColor="#000000"
            shadowBlur={32}
            shadowOpacity={0.8}
            listening={false}
          />

          {/* Asset Rendering & Split Clipping */}
          {isCompareMode && leftImage && rightImage ? (
            <>
              {/* Left Side of Split */}
              <Group
                clipFunc={(ctx) => {
                  ctx.rect(0, 0, compareSplitX, naturalHeight);
                }}
              >
                <KonvaImage
                  image={leftImage}
                  x={0}
                  y={0}
                  width={naturalWidth}
                  height={naturalHeight}
                  listening={false}
                />
              </Group>

              {/* Right Side of Split */}
              <Group
                clipFunc={(ctx) => {
                  ctx.rect(compareSplitX, 0, naturalWidth - compareSplitX, naturalHeight);
                }}
              >
                <KonvaImage
                  image={rightImage}
                  x={0}
                  y={0}
                  width={naturalWidth}
                  height={naturalHeight}
                  listening={false}
                />
              </Group>

              {/* Split Divider Line */}
              <Line
                points={[compareSplitX, 0, compareSplitX, naturalHeight]}
                stroke="#6366f1"
                strokeWidth={2 / stageScale}
                listening={false}
              />

              {/* Slider Handle */}
              <Circle
                x={compareSplitX}
                y={naturalHeight / 2}
                radius={16 / stageScale}
                fill="#4f46e5"
                stroke="#ffffff"
                strokeWidth={2 / stageScale}
                draggable
                dragBoundFunc={(pos) => {
                  const localX = (pos.x - stagePos.x) / stageScale;
                  const clampedX = Math.max(0, Math.min(localX, naturalWidth));
                  return {
                    x: stagePos.x + clampedX * stageScale,
                    y: stagePos.y + (naturalHeight / 2) * stageScale,
                  };
                }}
                onDragStart={() => setIsDraggingSlider(true)}
                onDragMove={handleSliderDrag}
                onDragEnd={() => setIsDraggingSlider(false)}
                cursor="ew-resize"
              />
            </>
          ) : (
            /* Single Current Version Asset */
            imageCurrent && (
              <KonvaImage
                image={imageCurrent}
                x={0}
                y={0}
                width={naturalWidth}
                height={naturalHeight}
                listening={false}
              />
            )
          )}

          {/* Watermark Overlay */}
          {renderWatermark()}

          {/* Spatial Pinned Comments */}
          {(!isUnlocked || showPins) &&
            !isCompareMode &&
            version.comments?.map((comment: CommentItem, idx: number) => {
              const pinX = comment.xPercent * naturalWidth;
              const pinY = comment.yPercent * naturalHeight;
              const isSelected = selectedCommentId === comment.id;

              return (
                <Group
                  key={comment.id}
                  x={pinX}
                  y={pinY}
                  scaleX={1 / stageScale}
                  scaleY={1 / stageScale}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    onSelectComment(comment.id);
                  }}
                  cursor="pointer"
                >
                  <Circle
                    radius={isSelected ? 16 : 13}
                    fill={comment.isResolved ? "#10b981" : isSelected ? "#4f46e5" : "#f97316"}
                    stroke="#ffffff"
                    strokeWidth={2}
                    shadowColor="#000000"
                    shadowBlur={8}
                    shadowOpacity={0.5}
                  />
                  <Text
                    text={`${idx + 1}`}
                    fontSize={11}
                    fontFamily="sans-serif"
                    fontStyle="bold"
                    fill="#ffffff"
                    offsetX={idx + 1 >= 10 ? 6 : 3.5}
                    offsetY={5.5}
                    listening={false}
                  />
                </Group>
              );
            })}

          {/* Draft Comment Pin Indicator */}
          {pendingPin && !isCompareMode && (
            <Group
              x={pendingPin.xPercent * naturalWidth}
              y={pendingPin.yPercent * naturalHeight}
              scaleX={1 / stageScale}
              scaleY={1 / stageScale}
              listening={false}
            >
              <Circle radius={16} fill="rgba(99, 102, 241, 0.35)" />
              <Circle radius={11} fill="#4f46e5" stroke="#ffffff" strokeWidth={2} />
              <Text
                text="+"
                fontSize={13}
                fontStyle="bold"
                fill="#ffffff"
                offsetX={4}
                offsetY={6}
              />
            </Group>
          )}
        </Layer>
      </Stage>

      {/* Floating Zoom HUD */}
      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-1 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800/90 backdrop-blur-md shadow-2xl text-zinc-300">
        <button
          onClick={() => handleManualZoom(-0.25)}
          title="Zoom Out (Wheel Down)"
          className="p-1.5 rounded-lg hover:bg-zinc-800 hover:text-white transition-all active:scale-95"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleResetTo100Percent}
          title="Reset to 100% Native Resolution"
          className="px-2 py-1 text-[11px] font-mono font-medium hover:bg-zinc-800 hover:text-white rounded-lg transition-all"
        >
          {Math.round(stageScale * 100)}%
        </button>

        <button
          onClick={() => handleManualZoom(0.25)}
          title="Zoom In (Wheel Up)"
          className="p-1.5 rounded-lg hover:bg-zinc-800 hover:text-white transition-all active:scale-95"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-zinc-800 mx-0.5" />

        <button
          onClick={handleFitToScreen}
          title="Fit Design to Viewport"
          className="p-1.5 rounded-lg hover:bg-zinc-800 hover:text-white transition-all active:scale-95"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="absolute bottom-5 left-5 z-20 pointer-events-none hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/70 border border-zinc-800/50 backdrop-blur-sm text-[11px] text-zinc-500 font-medium">
        <span>Scroll to Zoom</span>
        <span>&bull;</span>
        <span>Drag or Hold Space to Pan</span>
      </div>
    </div>
  );
}