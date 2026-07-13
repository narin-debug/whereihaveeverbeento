"use client";

import { useEffect, useRef } from "react";
import { loadNaverMaps } from "@/lib/naver-maps";
import { memoryPhotoUrl, promptAndDelete, type Memory } from "@/lib/memories";
import { useTranslations } from "@/lib/locale-context";

export default function DomesticMap({
  memories,
  onMemoryDeleted,
}: {
  memories: Memory[];
  onMemoryDeleted: (id: string) => void;
}) {
  const t = useTranslations();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const handleDelete = async (id: string) => {
    if (await promptAndDelete(id, t)) onMemoryDeleted(id);
  };

  useEffect(() => {
    let cancelled = false;

    loadNaverMaps().then(() => {
      if (cancelled || !containerRef.current) return;
      const { naver } = window;

      if (!mapRef.current) {
        mapRef.current = new naver.maps.Map(containerRef.current, {
          center: new naver.maps.LatLng(36.3, 127.8),
          zoom: 7,
          minZoom: 6,
        });
        const observer = new ResizeObserver(() => {
          naver.maps.Event.trigger(mapRef.current, "resize");
        });
        observer.observe(containerRef.current);
      }

      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = memories.map((memory) => {
        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(memory.lat, memory.lng),
          map: mapRef.current,
        });

        const content = document.createElement("div");
        content.style.padding = "8px";
        content.style.maxWidth = "180px";

        const img = document.createElement("img");
        img.src = memoryPhotoUrl(memory.id, memory.updatedAt);
        img.alt = memory.caption;
        img.style.width = "100%";
        img.style.height = "96px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "6px";
        content.appendChild(img);

        const caption = document.createElement("p");
        caption.textContent = memory.caption;
        caption.style.fontSize = "13px";
        caption.style.lineHeight = "1.4";
        caption.style.marginTop = "8px";
        content.appendChild(caption);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = t("deleteAction");
        deleteButton.setAttribute("aria-label", t("deleteAriaLabel"));
        deleteButton.style.fontSize = "12px";
        deleteButton.style.marginTop = "8px";
        deleteButton.style.color = "#52564e";
        deleteButton.onclick = () => handleDelete(memory.id);
        content.appendChild(deleteButton);

        const infoWindow = new naver.maps.InfoWindow({ content, borderWidth: 0 });
        naver.maps.Event.addListener(marker, "click", () => {
          infoWindow.open(mapRef.current, marker);
        });

        return marker;
      });
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memories]);

  return <div ref={containerRef} className="h-full w-full" />;
}
