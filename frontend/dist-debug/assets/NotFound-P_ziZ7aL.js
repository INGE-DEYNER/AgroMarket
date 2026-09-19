import{j as e,L as a}from"./index-CSMwz_9X.js";function i(){return e.jsxs("div",{style:{background:"#f4fbf7",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:"Inter, sans-serif",textAlign:"center",position:"relative",overflow:"hidden"},children:[e.jsxs("div",{className:"decorations",children:[e.jsx("span",{className:"fruit f1",children:"🍌"}),e.jsx("span",{className:"fruit f2",children:"🍍"}),e.jsx("span",{className:"fruit f3",children:"🥑"}),e.jsx("span",{className:"fruit f4",children:"🥭"}),e.jsx("span",{className:"fruit f5",children:"🍊"}),e.jsx("span",{className:"plant p1",children:"🌱"}),e.jsx("span",{className:"plant p2",children:"🌿"})]}),e.jsxs("div",{style:{position:"relative",zIndex:10,maxWidth:"500px"},children:[e.jsxs("svg",{viewBox:"0 0 200 200",width:"180",height:"180",style:{margin:"0 auto 24px auto"},className:"plant-svg",children:[e.jsx("circle",{cx:"100",cy:"100",r:"80",fill:"#e2ece2"}),e.jsx("path",{d:"M70 140 L130 140 L120 170 L80 170 Z",fill:"#b76e53"}),e.jsx("path",{d:"M100 140 C100 90, 80 80, 100 50",fill:"none",stroke:"#2d6a4f",strokeWidth:"6",strokeLinecap:"round",className:"stem-anim"}),e.jsx("path",{d:"M100 90 C85 85, 75 95, 100 90",fill:"#52b788",className:"leaf-left"}),e.jsx("path",{d:"M100 110 C115 105, 125 115, 100 110",fill:"#52b788",className:"leaf-right"}),e.jsx("path",{d:"M100 50 C90 40, 110 40, 100 50",fill:"#40916c",className:"leaf-top"})]}),e.jsx("h1",{style:{fontSize:"6rem",fontWeight:"900",color:"#1b4332",lineHeight:"1",margin:0},children:"404"}),e.jsx("h2",{style:{fontSize:"1.75rem",color:"#2d6a4f",fontWeight:"700",marginTop:"10px",marginBottom:"16px"},children:"¡Página Perdida en el Campo!"}),e.jsx("p",{style:{color:"#4a5568",fontSize:"1.05rem",lineHeight:"1.6",marginBottom:"32px"},children:"Parece que la página que buscas no se ha cultivado todavía o fue cosechada antes de tiempo. Regresa al inicio para seguir explorando."}),e.jsx(a,{to:"/home",style:{display:"inline-block",background:"#2d6a4f",color:"white",padding:"14px 36px",borderRadius:"30px",fontWeight:"bold",textDecoration:"none",boxShadow:"0 6px 20px rgba(45, 106, 79, 0.3)",transition:"all 0.3s"},className:"btn-cta-hover",children:"Volver al Inicio"})]}),e.jsx("style",{children:`
        .btn-cta-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(45, 106, 79, 0.4);
          background-color: #25553e;
        }
        .plant-svg {
          animation: pulse-svg 3s infinite ease-in-out;
        }
        @keyframes pulse-svg {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .decorations {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
        }
        .fruit, .plant {
          position: absolute;
          font-size: 2rem;
          opacity: 0.2;
          animation: float-around 8s infinite linear;
        }
        .f1 { left: 10%; top: 15%; animation-delay: 0s; }
        .f2 { right: 12%; top: 20%; animation-delay: 2s; }
        .f3 { left: 15%; bottom: 20%; animation-delay: 4s; }
        .f4 { right: 18%; bottom: 15%; animation-delay: 1s; }
        .f5 { left: 45%; top: 8%; animation-delay: 3s; }
        .p1 { left: 5%; top: 50%; animation-delay: 5s; font-size: 2.5rem; }
        .p2 { right: 8%; top: 48%; animation-delay: 1.5s; font-size: 2.5rem; }

        @keyframes float-around {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
      `})]})}export{i as default};
