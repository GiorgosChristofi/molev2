/* One neutral artwork, one measured live rim light, five independent faults. */
(() => {
  const universe = document.querySelector('.universe');
  const medallion = document.querySelector('.medallion');
  const vault = document.createElement('div');
  vault.className = 'vault-art'; vault.setAttribute('aria-hidden','true');
  const art = new Image();
  art.src = './assets/vault-rocks-v2-unlit.png';
  art.alt = ''; art.decoding = 'async'; art.draggable = false;
  const warmth = new Image();
  warmth.className = 'vault-warmth';
  warmth.src = './assets/vault-rocks-v1.png';
  warmth.alt = ''; warmth.decoding = 'async'; warmth.draggable = false;
  const reflectedLight = document.createElement('span');
  reflectedLight.className = 'vault-reflection';
  const rimTrack = document.createElement('div'); rimTrack.className = 'vault-rim-track';
  const movingSpill = document.createElement('span'); movingSpill.className = 'rim-light-spill';
  // Reuse the original rotating accent, with its track fitted to the metal artwork.
  rimTrack.append(movingSpill,document.querySelector('.orbit-arc'));
  vault.append(art,warmth,reflectedLight,rimTrack); medallion.prepend(vault);
  const atmosphere = document.createElement('div');
  atmosphere.className = 'buried-atmosphere'; atmosphere.setAttribute('aria-hidden','true');
  const designs = [
    {x:7,y:19,w:169,angle:-18,period:8.8,delay:-1.7},
    {x:94,y:24,w:139,angle:29,period:10.2,delay:-6.4},
    {x:8,y:89,w:196,angle:-11,period:11.4,delay:-3.2},
    {x:92,y:93,w:182,angle:34,period:9.7,delay:-7.1},
    {x:62,y:5,w:104,angle:13,period:12.3,delay:-4.5}
  ];
  const fractures = [
    {
      main:'M20 112 36 105 43 86 58 81 55 69 73 61 81 46 98 49 110 34 133 28 141 16',
      branches:'M55 69 74 76 89 71 102 84 123 81 136 91 160 88 171 99 194 103M81 46 72 32 55 28 48 15M110 34 126 48 144 44 155 59 177 63 184 77',
      fine:'M43 86 28 75 18 76M89 71 92 56 105 52M136 91 131 109 141 120M155 59 164 45 185 44M194 103 207 95 224 100',hot:'M55 69 73 61 81 46'
    },
    {
      main:'M37 18 51 29 47 43 65 47 73 65 90 69 84 88 101 98 119 93 133 112 155 117',
      branches:'M65 47 86 36 106 44 123 30 144 34 156 21M90 69 110 61 123 70 145 67 154 81 176 84 190 99M47 43 28 48 22 63 9 71',
      fine:'M106 44 110 25 122 14M123 70 119 85 126 92M154 81 163 65 181 62 195 48M101 98 88 113 94 131M176 84 190 73 217 80',hot:'M73 65 90 69 84 88'
    },
    {
      main:'M14 77 34 80 48 66 63 71 76 54 93 58 105 43 123 50 130 68 149 74 158 91 178 87 193 103 220 109',
      branches:'M48 66 41 49 52 36 48 19M93 58 89 77 101 85 95 107 111 122M123 50 142 38 152 45 171 35 186 41M158 91 144 108 151 124',
      fine:'M63 71 67 88 59 97M105 43 103 27 116 21M171 35 176 21 194 16M178 87 185 69 204 65M34 80 22 98 7 102',hot:'M105 43 123 50 130 68'
    },
    {
      main:'M101 9 95 26 108 41 99 56 117 66 111 84 126 96 120 116 137 131 132 146',
      branches:'M99 56 79 50 65 62 45 57 29 70M111 84 94 91 80 86 67 103 45 106M117 66 140 58 149 41 168 35 175 20M126 96 147 91 163 104 185 101 202 115',
      fine:'M65 62 60 77 46 83M80 86 73 71 58 67M149 41 131 29 134 17M163 104 161 121 172 135M185 101 196 86 213 83',hot:'M99 56 117 66 111 84'
    },
    {
      main:'M24 101 43 94 51 77 70 72 81 55 102 59 115 42 132 37 142 20',
      branches:'M70 72 82 85 101 81 112 95 136 92 150 106 175 110M102 59 121 70 139 61 151 76 173 73 188 86M51 77 38 65 24 68',
      fine:'M81 55 72 39 79 28M121 70 120 85 131 102M151 76 160 56 176 51M136 92 132 115 143 129M188 86 210 80 226 91',hot:'M70 72 81 55 102 59'
    }
  ];
  designs.forEach((d,i) => {
    const f = fractures[i],patch = document.createElement('div');
    patch.className = `earth-fissure fissure-${i+1}`;
    patch.style.cssText = `--crack-x:${d.x}%;--crack-y:${d.y}%;--crack-width:${d.w}px;--crack-angle:${d.angle}deg;--crack-period:${d.period}s;--crack-delay:${d.delay}s`;
    const shape = document.createElementNS('http://www.w3.org/2000/svg','svg');
    shape.setAttribute('viewBox','0 0 240 160'); shape.setAttribute('class','fissure-art');
    shape.innerHTML = `<defs><filter id="crackGlow${i}" x="-40%" y="-60%" width="180%" height="220%"><feGaussianBlur stdDeviation="2.6"/></filter></defs>
      <g class="fissure-soil" fill="#0c0906" stroke="#100b07" stroke-width=".5"><path d="M14 50 27 32 44 28 53 42 75 40 88 51 110 43 131 46 147 39 170 50 187 49 205 59 228 68 226 86 210 95 192 91 176 103 150 94 132 100 111 88 91 91 72 78 50 80 34 67 18 69Z"/></g>
      <g class="fissure-aura" filter="url(#crackGlow${i})" fill="none" stroke="#f86b08" stroke-width="1.9"><path d="${f.main}"/><path d="${f.branches}" stroke-width=".8" opacity=".35"/></g>
      <g class="fissure-lines" fill="none" stroke-linejoin="round" stroke-linecap="round">
        <path class="fissure-main" d="${f.main}" stroke="#cc560c" stroke-width=".7"/>
        <path class="fissure-branch" d="${f.branches}" stroke="#7e3109" stroke-width=".48"/>
        <path class="fissure-hairline" d="${f.fine}" stroke="#4c2109" stroke-width=".32"/>
        <path d="${f.hot}" stroke="#ff973b" stroke-width=".5"/>
      </g>`;
    patch.append(shape); atmosphere.append(patch);
  });
  universe.prepend(atmosphere);
})();
