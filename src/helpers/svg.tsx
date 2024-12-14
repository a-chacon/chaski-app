export const AtomSvg: React.FC = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-25 -26.75 50 50">
      <title>Atom</title>
      <style type="text/css">
        {`
          .path { fill: none; stroke: #66899a; }
          .path + .path { stroke: #e1d85d; }
          .path + .path + .path { stroke: #80a3cf; }
          .shell { fill: none; stroke: #4b541f; }
          .necleus { fill: #80a3cf; stroke: white; }
          .electron { fill: #66899a; stroke: white; }
        `}
      </style>
      <ellipse className="path" rx="3" ry="22" />
      <ellipse className="path" rx="3" ry="22" transform="rotate(-66)" />
      <ellipse className="path" rx="3" ry="22" transform="rotate(66)" />
      <circle className="shell" r="22" />
      <circle className="necleus" r="6.5" />
      <circle className="electron" cy="-22" r="4.5" />
      <circle className="electron" cx="-20" cy="9" r="4.5" />
      <circle className="electron" cx="20" cy="9" r="4.5" />
    </svg>
  );
};

export const RSSSvg: React.FC = () => {
  return (
    <svg
      viewBox="0 0 44 44"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      fill="#000000"
    >
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <title>RSS-color</title> <desc>Created with Sketch.</desc>{" "}
        <defs> </defs>{" "}
        <g
          id="Icons"
          stroke="none"
          stroke-width="1"
          fill="none"
          fillRule="evenodd"
        >
          {" "}
          <g
            id="Color-"
            transform="translate(-800.000000, -760.000000)"
            fill="#FF9A00"
          >
            {" "}
            <path
              d="M800.000471,797.714286 C800.000471,794.243 802.81487,791.428571 806.286118,791.428571 C809.757367,791.428571 812.571765,794.243 812.571765,797.714286 C812.571765,801.185571 809.757367,804 806.286118,804 C802.81487,804 800.000471,801.185571 800.000471,797.714286 Z M844,804 L835.619661,804 C835.619661,784.358714 819.641547,768.380429 800.000471,768.380429 L800.000471,760 C824.261497,760 844,779.738714 844,804 Z M829.333543,804 L820.953204,804 C820.953204,792.446857 811.553019,783.048143 800,783.048143 L800,774.666143 C816.174541,774.666143 829.333543,787.825286 829.333543,804 Z"
              id="RSS"
            >
              {" "}
            </path>{" "}
          </g>{" "}
        </g>{" "}
      </g>
    </svg>
  );
};
