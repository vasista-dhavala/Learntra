import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { BufferGeometry, Vector3, QuadraticBezierCurve3 } from "three";
import { useNavigate } from "react-router-dom";

import ErrorBoundary from "./ErrorBoundary.jsx";
import { LAND, LW, LH } from "../data/landMask.js";
import "./Globe.css";

/* =========================================================
   LAND MASK
========================================================= */

const mask = (() => {
  const b = atob(LAND);
  const o = new Uint8Array(LW * LH);

  for (let i = 0; i < o.length; i++) {
    o[i] = (b.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
  }

  return o;
})();

/* =========================================================
   LAT/LON -> 3D POSITION
========================================================= */

const ll = (lat, lon, r = 1) => {
  const a = (lat * Math.PI) / 180;
  const b = (lon * Math.PI) / 180;

  return new Vector3(
    r * Math.cos(a) * Math.sin(b),
    r * Math.sin(a),
    r * Math.cos(a) * Math.cos(b),
  );
};

/* =========================================================
   CITY DATA
========================================================= */

const CITY = {
  NYC: [40.7, -74],
  LON: [51.5, -0.1],
  BOM: [19.1, 72.9],
  SIN: [1.3, 103.8],
  TYO: [35.7, 139.7],
  SFO: [37.8, -122.4],
  DXB: [25.2, 55.3],
  GRU: [-23.5, -46.6],
  SYD: [-33.9, 151.2],
};

const PAIRS = [
  ["NYC", "LON"],
  ["LON", "BOM"],
  ["BOM", "SIN"],
  ["TYO", "SFO"],
  ["BOM", "DXB"],
  ["GRU", "LON"],
  ["SYD", "SIN"],
  ["NYC", "BOM"],
  ["SIN", "TYO"],
];

/* =========================================================
   STOCK / MARKET NODES
========================================================= */

const NODES = [
  /* INDIA */
  {
    id: "in-1",
    country: "India",
    symbol: "RELIANCE",
    name: "Reliance Industries",
    lat: 19.1,
    lon: 72.9,
    price: "₹1,482.30",
    change: "+1.82%",
    positive: true,
    sector: "Energy",
  },
  {
    id: "in-2",
    country: "India",
    symbol: "TCS",
    name: "Tata Consultancy Services",
    lat: 19.0,
    lon: 73.0,
    price: "₹3,964.50",
    change: "+0.94%",
    positive: true,
    sector: "IT",
  },
  {
    id: "in-3",
    country: "India",
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    lat: 18.95,
    lon: 72.83,
    price: "₹1,684.20",
    change: "-0.41%",
    positive: false,
    sector: "Banking",
  },

  /* USA */
  {
    id: "us-1",
    country: "USA",
    symbol: "NVDA",
    name: "NVIDIA",
    lat: 37.8,
    lon: -122.4,
    price: "$181.42",
    change: "+2.74%",
    positive: true,
    sector: "Semiconductors",
  },
  {
    id: "us-2",
    country: "USA",
    symbol: "AAPL",
    name: "Apple",
    lat: 37.33,
    lon: -122.03,
    price: "$256.82",
    change: "+1.16%",
    positive: true,
    sector: "Technology",
  },
  {
    id: "us-3",
    country: "USA",
    symbol: "GOOGL",
    name: "Alphabet",
    lat: 37.42,
    lon: -122.08,
    price: "$291.64",
    change: "-0.62%",
    positive: false,
    sector: "Technology",
  },

  /* CHINA */
  {
    id: "cn-1",
    country: "China",
    symbol: "TCEHY",
    name: "Tencent",
    lat: 22.54,
    lon: 114.06,
    price: "HK$612.40",
    change: "+1.42%",
    positive: true,
    sector: "Technology",
  },
  {
    id: "cn-2",
    country: "China",
    symbol: "BABA",
    name: "Alibaba",
    lat: 30.27,
    lon: 120.15,
    price: "HK$158.70",
    change: "+0.86%",
    positive: true,
    sector: "E-Commerce",
  },
  {
    id: "cn-3",
    country: "China",
    symbol: "ICBC",
    name: "ICBC",
    lat: 39.9,
    lon: 116.4,
    price: "¥7.12",
    change: "-0.23%",
    positive: false,
    sector: "Banking",
  },

  /* JAPAN */
  {
    id: "jp-1",
    country: "Japan",
    symbol: "TM",
    name: "Toyota",
    lat: 35.7,
    lon: 139.7,
    price: "¥3,081",
    change: "+0.72%",
    positive: true,
    sector: "Automotive",
  },
  {
    id: "jp-2",
    country: "Japan",
    symbol: "SONY",
    name: "Sony",
    lat: 35.68,
    lon: 139.76,
    price: "¥3,184",
    change: "+1.13%",
    positive: true,
    sector: "Electronics",
  },
  {
    id: "jp-3",
    country: "Japan",
    symbol: "MUFG",
    name: "MUFG",
    lat: 35.68,
    lon: 139.77,
    price: "¥2,286",
    change: "-0.38%",
    positive: false,
    sector: "Banking",
  },

  /* UK */
  {
    id: "uk-1",
    country: "UK",
    symbol: "HSBC",
    name: "HSBC",
    lat: 51.5,
    lon: -0.1,
    price: "£10.12",
    change: "+0.91%",
    positive: true,
    sector: "Banking",
  },
  {
    id: "uk-2",
    country: "UK",
    symbol: "AZN",
    name: "AstraZeneca",
    lat: 51.52,
    lon: -0.08,
    price: "£126.40",
    change: "+0.67%",
    positive: true,
    sector: "Healthcare",
  },
  {
    id: "uk-3",
    country: "UK",
    symbol: "SHEL",
    name: "Shell",
    lat: 51.51,
    lon: -0.09,
    price: "£28.64",
    change: "-0.34%",
    positive: false,
    sector: "Energy",
  },

  /* CANADA */
  {
    id: "ca-1",
    country: "Canada",
    symbol: "RY",
    name: "Royal Bank of Canada",
    lat: 43.65,
    lon: -79.38,
    price: "C$193.40",
    change: "+0.82%",
    positive: true,
    sector: "Banking",
  },
  {
    id: "ca-2",
    country: "Canada",
    symbol: "TD",
    name: "TD Bank",
    lat: 43.65,
    lon: -79.38,
    price: "C$112.26",
    change: "+0.41%",
    positive: true,
    sector: "Banking",
  },
  {
    id: "ca-3",
    country: "Canada",
    symbol: "SHOP",
    name: "Shopify",
    lat: 43.65,
    lon: -79.38,
    price: "C$196.30",
    change: "-1.02%",
    positive: false,
    sector: "E-Commerce",
  },

  /* TAIWAN */
  {
    id: "tw-1",
    country: "Taiwan",
    symbol: "TSM",
    name: "TSMC",
    lat: 25.03,
    lon: 121.56,
    price: "NT$1,485",
    change: "+2.36%",
    positive: true,
    sector: "Semiconductors",
  },
  {
    id: "tw-2",
    country: "Taiwan",
    symbol: "MTK",
    name: "MediaTek",
    lat: 25.03,
    lon: 121.56,
    price: "NT$1,420",
    change: "+0.93%",
    positive: true,
    sector: "Semiconductors",
  },
  {
    id: "tw-3",
    country: "Taiwan",
    symbol: "HNHAF",
    name: "Hon Hai",
    lat: 25.03,
    lon: 121.56,
    price: "NT$206",
    change: "-0.29%",
    positive: false,
    sector: "Electronics",
  },

  /* SOUTH KOREA */
  {
    id: "kr-1",
    country: "South Korea",
    symbol: "005930",
    name: "Samsung Electronics",
    lat: 37.57,
    lon: 126.98,
    price: "₩98,200",
    change: "+1.54%",
    positive: true,
    sector: "Electronics",
  },
  {
    id: "kr-2",
    country: "South Korea",
    symbol: "000660",
    name: "SK Hynix",
    lat: 37.57,
    lon: 126.98,
    price: "₩288,500",
    change: "+2.11%",
    positive: true,
    sector: "Semiconductors",
  },
  {
    id: "kr-3",
    country: "South Korea",
    symbol: "005380",
    name: "Hyundai Motor",
    lat: 37.57,
    lon: 126.98,
    price: "₩287,000",
    change: "-0.58%",
    positive: false,
    sector: "Automotive",
  },

  /* FRANCE */
  {
    id: "fr-1",
    country: "France",
    symbol: "MC",
    name: "LVMH",
    lat: 48.86,
    lon: 2.35,
    price: "€612.80",
    change: "+0.78%",
    positive: true,
    sector: "Luxury",
  },
  {
    id: "fr-2",
    country: "France",
    symbol: "OR",
    name: "L'Oréal",
    lat: 48.86,
    lon: 2.35,
    price: "€427.60",
    change: "+0.46%",
    positive: true,
    sector: "Consumer",
  },
  {
    id: "fr-3",
    country: "France",
    symbol: "RMS",
    name: "Hermès",
    lat: 48.86,
    lon: 2.35,
    price: "€2,184",
    change: "-0.21%",
    positive: false,
    sector: "Luxury",
  },

  /* GERMANY */
  {
    id: "de-1",
    country: "Germany",
    symbol: "SAP",
    name: "SAP",
    lat: 50.11,
    lon: 8.68,
    price: "€241.50",
    change: "+1.07%",
    positive: true,
    sector: "Software",
  },
  {
    id: "de-2",
    country: "Germany",
    symbol: "SIE",
    name: "Siemens",
    lat: 48.14,
    lon: 11.58,
    price: "€248.20",
    change: "+0.64%",
    positive: true,
    sector: "Industrial",
  },
  {
    id: "de-3",
    country: "Germany",
    symbol: "ALV",
    name: "Allianz",
    lat: 48.14,
    lon: 11.58,
    price: "€382.40",
    change: "-0.35%",
    positive: false,
    sector: "Insurance",
  },
];

const GROUPS = [
  "India",
  "USA",
  "China",
  "Japan",
  "UK",
  "Canada",
  "Taiwan",
  "South Korea",
  "France",
  "Germany",
];

/* =========================================================
   EARTH SHADER
========================================================= */

const VS = `
varying vec3 vN;

void main() {
  vN = normalize(normalMatrix * normal);

  gl_Position =
    projectionMatrix *
    modelViewMatrix *
    vec4(position, 1.0);
}
`;

const FS = `
varying vec3 vN;

void main() {
  float f = pow(
    1.0 - clamp(vN.z, 0.0, 1.0),
    2.4
  );

  vec3 c =
    vec3(0.015, 0.035, 0.10) +
    vec3(0.045, 0.12, 0.30) * f;

  gl_FragColor = vec4(c, 1.0);
}
`;

/* =========================================================
   ARC
========================================================= */

function Arc({ a, b, i }) {
  const seg = useRef();

  const geometry = useMemo(() => {
    const p0 = ll(...CITY[a]);
    const p1 = ll(...CITY[b]);

    const angle = p0.angleTo(p1);

    const control = p0
      .clone()
      .add(p1)
      .normalize()
      .multiplyScalar(1 + angle * 0.85);

    const curve = new QuadraticBezierCurve3(p0, control, p1);

    return new BufferGeometry().setFromPoints(curve.getPoints(70));
  }, [a, b]);

  useFrame(({ clock }) => {
    if (!seg.current) return;

    const t = (clock.getElapsedTime() * 0.18 + i * 0.13) % 1;

    const count = seg.current.geometry.attributes.position.count;

    seg.current.geometry.setDrawRange(
      Math.floor(t * count),
      Math.max(5, Math.floor(count * 0.2)),
    );
  });

  return (
    <group>
      <line>
        <primitive object={geometry} attach="geometry" />
        <lineBasicMaterial color="#4f46e5" transparent opacity={0.16} />
      </line>

      <line ref={seg}>
        <primitive object={geometry.clone()} attach="geometry" />
        <lineBasicMaterial color="#8b5cf6" transparent opacity={0.9} />
      </line>
    </group>
  );
}

/* =========================================================
   EARTH
========================================================= */

function Earth({ earthRef, ctl, radius }) {
  const points = useMemo(() => {
    const arr = [];

    for (let y = 0; y < LH; y += 2) {
      for (let x = 0; x < LW; x += 2) {
        const idx = y * LW + x;

        if (!mask[idx]) continue;

        const lat = 90 - (y / (LH - 1)) * 180;
        const lon = (x / (LW - 1)) * 360 - 180;

        arr.push(ll(lat, lon, 1.012));
      }
    }

    return arr;
  }, []);

  const cityPoints = useMemo(
    () => Object.values(CITY).map(([lat, lon]) => ll(lat, lon, 1.025)),
    [],
  );

  const pointGeometry = useMemo(() => {
    return new BufferGeometry().setFromPoints(points);
  }, [points]);

  const cityGeometry = useMemo(() => {
    return new BufferGeometry().setFromPoints(cityPoints);
  }, [cityPoints]);

  useFrame((_, dt) => {
    if (!ctl.current.dragging) {
      ctl.current.y -= dt * ((Math.PI * 2) / 100);
    }

    ctl.current.x = Math.max(-0.7, Math.min(0.7, ctl.current.x));

    earthRef.current.rotation.y = ctl.current.y;
    earthRef.current.rotation.x = ctl.current.x;
  });

  return (
    <group ref={earthRef}>
      {/* Earth */}
      <mesh scale={radius}>
        <sphereGeometry args={[1, 96, 96]} />
        <shaderMaterial vertexShader={VS} fragmentShader={FS} />
      </mesh>

      {/* Land dots */}
      <points scale={radius}>
        <primitive object={pointGeometry} attach="geometry" />

        <pointsMaterial
          color="#3b82f6"
          size={2.1}
          sizeAttenuation={false}
          transparent
          opacity={0.82}
        />
      </points>

      {/* City nodes */}
      <points scale={radius}>
        <primitive object={cityGeometry} attach="geometry" />

        <pointsMaterial
          color="#a78bfa"
          size={4.8}
          sizeAttenuation={false}
          transparent
          opacity={1}
        />
      </points>

      {/* Global routes */}
      {PAIRS.map(([a, b], i) => (
        <Arc key={`${a}-${b}`} a={a} b={b} i={i} />
      ))}
    </group>
  );
}

/* =========================================================
   CARD TRACKER
   ---------------------------------------------------------
   IMPORTANT:
   This intentionally mutates DOM styles directly instead
   of using React state inside useFrame.
========================================================= */

function CardTracker({ earthRef, cardRefs, nodes }) {
  const { camera, size } = useThree();

  const temp = useMemo(() => new Vector3(), []);

  useFrame(() => {
    if (!earthRef.current) return;

    nodes.forEach((node) => {
      const el = cardRefs.current[node.id];

      if (!el) return;

      earthRef.current.localToWorld(temp.copy(ll(node.lat, node.lon, 1.045)));

      const depth = temp.z;

      temp.project(camera);

      const x = ((temp.x + 1) / 2) * size.width;

      const y = ((1 - temp.y) / 2) * size.height;

      const visible =
        depth > 0.015 &&
        temp.x > -1.25 &&
        temp.x < 1.25 &&
        temp.y > -1.25 &&
        temp.y < 1.25;

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;

      el.style.opacity = visible ? "1" : "0";

      el.style.pointerEvents = visible ? "auto" : "none";

      el.style.zIndex = String(Math.round(1000 + depth * 100));
    });
  });

  return null;
}

/* =========================================================
   STOCK CARD
========================================================= */

function StockCard({
  node,
  cardRefs,
  focused,
  offsetX = 0,
  offsetY = 0,
  onClick,
}) {
  return (
    <div
      ref={(el) => {
        if (el) {
          cardRefs.current[node.id] = el;
        }
      }}
      className={`globe-stock-card ${
        focused ? "is-focused" : "is-country-card"
      }`}
      style={{
        transform: `
          translate(
            calc(-50% + ${offsetX}px),
            calc(-50% + ${offsetY}px)
          )
        `,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(node, e);
      }}
    >
      <div className="globe-stock-icon">{node.symbol.slice(0, 2)}</div>

      <div className="globe-stock-info">
        <div className="globe-stock-top">
          <strong>{node.symbol}</strong>

          <span
            className={node.positive ? "globe-stock-up" : "globe-stock-down"}
          >
            {node.change}
          </span>
        </div>

        <div className="globe-stock-name">{node.name}</div>

        <div className="globe-stock-meta">
          <span>{node.price}</span>
          <span>{node.sector}</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN GLOBE
========================================================= */

export default function Globe() {
  const navigate = useNavigate();

  const wrapperRef = useRef(null);
  const earthRef = useRef(null);
  const cardRefs = useRef({});

  const [hoverCountry, setHoverCountry] = useState(null);

  const [lockedCountry, setLockedCountry] = useState(null);

  const [zoom, setZoom] = useState(1);

  const [size, setSize] = useState({
    width: 600,
    height: 600,
  });

  const [visible, setVisible] = useState(true);

  const ctl = useRef({
    x: 0.4,
    y: 0,
    dragging: false,
    px: 0,
    py: 0,
  });

  /* =======================================================
     RESIZE OBSERVER
  ======================================================= */

  useEffect(() => {
    const el = wrapperRef.current;

    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();

      setSize({
        width: rect.width,
        height: rect.height,
      });
    };

    update();

    const observer = new ResizeObserver(update);

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  /* =======================================================
     INTERSECTION OBSERVER
  ======================================================= */

  useEffect(() => {
    const el = wrapperRef.current;

    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.05,
      },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  /* =======================================================
     FIXED WHEEL ZOOM
     
     This is the important part:
     preventDefault() stops the browser from
     scrolling the entire page.
  ======================================================= */

  const handleWheel = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();

    setZoom((current) => {
      const next = current - event.deltaY * 0.0015;

      return Math.min(1.45, Math.max(0.72, next));
    });
  }, []);

  /* =======================================================
     NATIVE NON-PASSIVE WHEEL LISTENER
     
     React/browser wheel listeners can sometimes be
     treated differently depending on the environment.
     Using passive:false guarantees preventDefault works.
  ======================================================= */

  useEffect(() => {
    const el = wrapperRef.current;

    if (!el) return;

    const wheelHandler = (event) => {
      handleWheel(event);
    };

    el.addEventListener("wheel", wheelHandler, {
      passive: false,
    });

    return () => {
      el.removeEventListener("wheel", wheelHandler);
    };
  }, [handleWheel]);

  /* =======================================================
     POINTER DRAG
  ======================================================= */

  const onPointerDown = (e) => {
    ctl.current.dragging = true;
    ctl.current.px = e.clientX;
    ctl.current.py = e.clientY;

    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!ctl.current.dragging) return;

    const dx = e.clientX - ctl.current.px;

    const dy = e.clientY - ctl.current.py;

    ctl.current.y += dx * 0.006;
    ctl.current.x += dy * 0.004;

    ctl.current.px = e.clientX;
    ctl.current.py = e.clientY;
  };

  const stopDragging = (e) => {
    ctl.current.dragging = false;

    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore release errors
    }
  };

  /* =======================================================
     COUNTRY CLICK
  ======================================================= */

  const clickCountry = (node, event) => {
    event?.stopPropagation();

    setLockedCountry((current) =>
      current === node.country ? null : node.country,
    );
  };

  /* =======================================================
     STOCK CLICK
  ======================================================= */

  const clickStock = (node) => {
    navigate(`/simulation?symbol=${encodeURIComponent(node.symbol)}`);
  };

  /* =======================================================
     ACTIVE COUNTRY
  ======================================================= */

  const activeCountry = lockedCountry || hoverCountry;

  const activeNodes = activeCountry
    ? NODES.filter((node) => node.country === activeCountry)
    : [];

  /* =======================================================
     COUNTRY REPRESENTATIVE CARDS
  ======================================================= */

  const countryNodes = GROUPS.map((country) =>
    NODES.find((node) => node.country === country),
  ).filter(Boolean);

  /* =======================================================
     FAN POSITIONS
  ======================================================= */

  const fanOffsets = [
    {
      x: -72,
      y: -55,
    },
    {
      x: 72,
      y: -12,
    },
    {
      x: 0,
      y: 72,
    },
  ];

  return (
    <ErrorBoundary
      fallback={
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 30%, #1e40af, #07142f 70%)",
          }}
        />
      }
    >
      <div
        ref={wrapperRef}
        className="gl"
        style={{
          position: "relative",
          overflow: "visible",

          /*
            Prevent scroll chaining at the globe.
            The native wheel handler above additionally
            calls preventDefault().
          */
          overscrollBehavior: "contain",

          touchAction: "pan-y",

          cursor: ctl.current.dragging ? "grabbing" : "grab",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onPointerLeave={(e) => {
          stopDragging(e);

          if (!lockedCountry) {
            setHoverCountry(null);
          }
        }}
        onMouseLeave={() => {
          if (!lockedCountry) {
            setHoverCountry(null);
          }
        }}
      >
        {/* =================================================
            THREE.JS GLOBE
        ================================================= */}

        <Canvas
          orthographic
          frameloop={visible ? "always" : "never"}
          camera={{
            position: [0, 0, 5000],
            near: 1,
            far: 10000,
            zoom: 1,
          }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
          }}
        >
          <group scale={size.width * 0.37 * zoom}>
            <Earth earthRef={earthRef} ctl={ctl} radius={1} />
          </group>

          {/* Track DOM cards against 3D nodes */}
          <CardTracker earthRef={earthRef} cardRefs={cardRefs} nodes={NODES} />
        </Canvas>

        {/* =================================================
            DOM STOCK CARD LAYER
        ================================================= */}

        <div
          className="globe-stock-layer"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          {/* -----------------------------------------------
              DEFAULT: ONE CARD PER COUNTRY
          ------------------------------------------------ */}

          {!activeCountry &&
            countryNodes.map((node) => (
              <StockCard
                key={node.id}
                node={node}
                cardRefs={cardRefs}
                focused={false}
                onClick={clickStock}
              />
            ))}

          {/* -----------------------------------------------
              ACTIVE COUNTRY: THREE STOCKS
          ------------------------------------------------ */}

          {activeCountry &&
            activeNodes.map((node, index) => {
              const offset = fanOffsets[index] || {
                x: 0,
                y: 0,
              };

              return (
                <StockCard
                  key={node.id}
                  node={node}
                  cardRefs={cardRefs}
                  focused={true}
                  offsetX={offset.x}
                  offsetY={offset.y}
                  onClick={clickStock}
                />
              );
            })}
        </div>

        {/* =================================================
            ZOOM INDICATOR
        ================================================= */}

        <div
          style={{
            position: "absolute",
            right: 18,
            bottom: 18,
            padding: "6px 10px",
            borderRadius: 999,
            background: "rgba(5, 15, 38, 0.72)",
            border: "1px solid rgba(148,163,184,0.18)",
            color: "#cbd5e1",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.4,
            pointerEvents: "none",
            backdropFilter: "blur(10px)",
          }}
        >
          Zoom {Math.round(zoom * 100)}%
        </div>
      </div>
    </ErrorBoundary>
  );
}
