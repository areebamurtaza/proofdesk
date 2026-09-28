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
  Loader2,
  AlertCircle
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
  const dragStartCoord = useRef<{ x: number; y: number } | null>(null);
  const didDragCanvasRef = useRef<boolean>(false);

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

  const isSourceMasterFile = useMemo(() => {
    return (
      /\.(zip|ai|eps)$/i.test(version.fileName) ||
      version.mimeType === "application/zip" ||
      version.mimeType === "application/x-zip-compressed" ||
      version.mimeType === "application/postscript" ||
      version.mimeType === "application/illustrator"
    );
  }, [version.fileName, version.mimeType]);

  // Load Primary (Current) & Secondary (Compared) Images
  // We avoid crossOrigin "anonymous" to prevent browser CORS rejections on local/staging environments
  const [imageCurrent, statusCurrent] = useImage(version.previewUrl);
  const [imageFallback] = useImage(
    statusCurrent === "failed" && version.fallbackPreviewUrl ? version.fallbackPreviewUrl : ""
  );
  const activeImage = imageCurrent || imageFallback;

  const [imageCompare] = useImage(activeCompareVersion?.previewUrl || "");

  // Determine which asset is on the Left vs Right side of the divider
  const leftImage = isSwapped ? activeImage : imageCompare;
  const rightImage = isSwapped ? imageCompare : activeImage;
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

  const naturalWidth = activeImage?.naturalWidth || activeImage?.width || 1200;
  const naturalHeight = activeImage?.naturalHeight || activeImage?.height || 800;

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
    if (!containerRef.current || !activeImage) return;

    const availableWidth = containerRef.current.offsetWidth - 64;
    const availableHeight = containerRef.current.offsetHeight - 64;

    const scale = Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight, 1.0);
    const initialX = (containerRef.current.offsetWidth - naturalWidth * scale) / 2;
    const initialY = (containerRef.current.offsetHeight - naturalHeight * scale) / 2;

    setStageScale(scale);
    setStagePos({ x: initialX, y: initialY });
    setCompareSplitX(naturalWidth / 2);
  }, [activeImage, naturalWidth, naturalHeight]);

  useEffect(() => {
    if (activeImage) {
      handleFitToScreen();
    }
  }, [activeImage, handleFitToScreen]);

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
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isPinModeActive || isUnlocked || isSpacePressed || isDraggingCanvas || isDraggingSlider || didDragCanvasRef.current) return;

    // Check if mouse moved appreciably between mousedown and click (e.g. while dragging or panning)
    if (dragStartCoord.current && e?.evt) {
      const clientX = "clientX" in e.evt ? (e.evt as MouseEvent).clientX : (e.evt as TouchEvent).touches?.[0]?.clientX ?? 0;
      const clientY = "clientY" in e.evt ? (e.evt as MouseEvent).clientY : (e.evt as TouchEvent).touches?.[0]?.clientY ?? 0;
      if (clientX !== 0 || clientY !== 0) {
        const dist = Math.hypot(clientX - dragStartCoord.current.x, clientY - dragStartCoord.current.y);
        if (dist > 5) return;
      }
    }

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
        onMouseDown={(e) => {
          dragStartCoord.current = { x: e.evt.clientX, y: e.evt.clientY };
        }}
        onTouchStart={(e) => {
          const touch = e.evt.touches?.[0];
          if (touch) {
            dragStartCoord.current = { x: touch.clientX, y: touch.clientY };
          }
        }}
        onDragStart={() => {
          didDragCanvasRef.current = true;
          setIsDraggingCanvas(true);
        }}
        onDragEnd={(e) => {
          setIsDraggingCanvas(false);
          if (e.target === stageRef.current) {
            setStagePos(e.target.position());
          }
          setTimeout(() => {
            didDragCanvasRef.current = false;
          }, 150);
        }}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          {/* Card Border & Drop Shadow */}
          <Rect
            x={-1}
            y={-1}
            width={naturalWidth + 2}
            height={naturalHeight + 2}
            fill="#ffffff"
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
            activeImage && (
              <KonvaImage
                image={activeImage}
                x={0}
                y={0}
                width={naturalWidth}
                height={naturalHeight}
                listening={false}
              />
            )
          )}

          {/* Unlocked Master Deliverable Vault Card (covers any legacy burned-in escrow watermark on master files) */}
          {isUnlocked && isSourceMasterFile && !isCompareMode && (
            <Group listening={false}>
              {/* Card Container covering old placeholder box */}
              <Rect
                x={naturalWidth / 2 - 425}
                y={naturalHeight / 2 - 265}
                width={850}
                height={530}
                fill="#18181b"
                stroke="#10b981"
                strokeWidth={2}
                cornerRadius={24}
                shadowColor="#10b981"
                shadowBlur={32}
                shadowOpacity={0.2}
              />

              {/* Status Header Badge */}
              <Text
                x={naturalWidth / 2}
                y={naturalHeight / 2 - 145}
                text={`• ${version.fileName.split(".").pop()?.toUpperCase() || "MASTER"} MASTER ARCHIVE • UNLOCKED & RELEASED •`}
                fontSize={22}
                fontFamily="monospace"
                fontStyle="bold"
                fill="#34d399"
                align="center"
                offsetX={350}
                width={700}
              />

              {/* Master File Name */}
              <Text
                x={naturalWidth / 2}
                y={naturalHeight / 2 - 55}
                text={version.fileName.length > 32 ? version.fileName.substring(0, 29) + "..." : version.fileName}
                fontSize={34}
                fontFamily="sans-serif"
                fontStyle="bold"
                fill="#f4f4f5"
                align="center"
                offsetX={380}
                width={760}
              />

              {/* Metadata description */}
              <Text
                x={naturalWidth / 2}
                y={naturalHeight / 2 + 20}
                text="Clean uncompressed master package is paid and released from escrow."
                fontSize={18}
                fontFamily="sans-serif"
                fill="#a1a1aa"
                align="center"
                offsetX={350}
                width={700}
              />

              <Text
                x={naturalWidth / 2}
                y={naturalHeight / 2 + 58}
                text={`File Size: ${(version.fileSize / (1024 * 1024)).toFixed(2)} MB • Verified & Licensed for Production`}
                fontSize={15}
                fontFamily="sans-serif"
                fill="#71717a"
                align="center"
                offsetX={350}
                width={700}
              />

              {/* Verified Pill Badge */}
              <Rect
                x={naturalWidth / 2 - 150}
                y={naturalHeight / 2 + 120}
                width={300}
                height={42}
                fill="rgba(16, 185, 129, 0.12)"
                stroke="#10b981"
                strokeWidth={1.5}
                cornerRadius={12}
              />
              <Text
                x={naturalWidth / 2}
                y={naturalHeight / 2 + 133}
                text="✓ MASTER ARCHIVE UNLOCKED"
                fontSize={13}
                fontFamily="monospace"
                fontStyle="bold"
                letterSpacing={1.5}
                fill="#34d399"
                align="center"
                offsetX={150}
                width={300}
              />
            </Group>
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
                  onTap={(e) => {
                    e.cancelBubble = true;
                    onSelectComment(comment.id);
                  }}
                  cursor="pointer"
                >
                  {/* Selection Halo */}
                  {isSelected && (
                    <Circle
                      radius={22}
                      fill="#D7C3A5"
                      opacity={0.35}
                      listening={false}
                    />
                  )}
                  <Circle
                    radius={isSelected ? 16 : 13}
                    fill={comment.isResolved ? "#2F6B4F" : isSelected ? "#D7C3A5" : "#172B4D"}
                    stroke={isSelected ? "#0B1628" : "#FFFFFF"}
                    strokeWidth={2}
                    shadowColor="#000000"
                    shadowBlur={10}
                    shadowOpacity={0.6}
                  />
                  <Text
                    text={`${idx + 1}`}
                    fontSize={11}
                    fontFamily="sans-serif"
                    fontStyle="bold"
                    fill={comment.isResolved ? "#FFFFFF" : isSelected ? "#0B1628" : "#FFFFFF"}
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
              <Circle radius={20} fill="rgba(215, 195, 165, 0.4)" />
              <Circle radius={13} fill="#D7C3A5" stroke="#172B4D" strokeWidth={2} />
              <Text
                text="+"
                fontSize={14}
                fontStyle="bold"
                fill="#172B4D"
                offsetX={4.5}
                offsetY={6.5}
              />
            </Group>
          )}
        </Layer>
      </Stage>

      {/* Floating Zoom HUD */}
      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-1 p-1 rounded-xl bg-[#0B1628]/95 border border-[#29466F]/50 backdrop-blur-md shadow-2xl text-[#F8F6F1]">
        <button
          onClick={() => handleManualZoom(-0.25)}
          title="Zoom Out (Wheel Down)"
          className="p-1.5 rounded-lg hover:bg-[#172B4D] hover:text-[#D7C3A5] transition-all active:scale-95"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleResetTo100Percent}
          title="Reset to 100% Native Resolution"
          className="px-2 py-1 text-[11px] font-mono font-bold hover:bg-[#172B4D] hover:text-[#D7C3A5] rounded-lg transition-all"
        >
          {Math.round(stageScale * 100)}%
        </button>

        <button
          onClick={() => handleManualZoom(0.25)}
          title="Zoom In (Wheel Up)"
          className="p-1.5 rounded-lg hover:bg-[#172B4D] hover:text-[#D7C3A5] transition-all active:scale-95"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-[#29466F]/60 mx-0.5" />

        <button
          onClick={handleFitToScreen}
          title="Fit Design to Viewport"
          className="p-1.5 rounded-lg hover:bg-[#172B4D] hover:text-[#D7C3A5] transition-all active:scale-95"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="absolute bottom-5 left-5 z-20 pointer-events-none hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0B1628]/90 border border-[#29466F]/50 backdrop-blur-sm text-[11px] text-[#DDD8CF] font-medium shadow-lg">
        <span>Scroll to Zoom</span>
        <span>&bull;</span>
        <span>Drag or Hold Space to Pan</span>
      </div>

      {/* Loading Overlay */}
      {statusCurrent === "loading" && !activeImage && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/60 backdrop-blur-xs pointer-events-none transition-opacity">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900/95 border border-zinc-800 shadow-2xl">
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            <span className="text-xs text-zinc-200 font-medium tracking-wide">
              {isUnlocked ? "Rendering unwatermarked master asset..." : "Loading design canvas..."}
            </span>
          </div>
        </div>
      )}

      {/* Asset Render Fallback / Failure Overlay */}
      {statusCurrent === "failed" && !activeImage && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-xs p-6">
          <div className="max-w-sm w-full p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">Asset Preview Unavailable</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {isUnlocked
                ? "The master asset is ready for direct download. Master source files can be downloaded using the button above."
                : "The asset preview could not be rendered by the canvas viewport."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}