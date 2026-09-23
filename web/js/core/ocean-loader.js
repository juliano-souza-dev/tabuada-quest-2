(function (root) {
    const TQ = root.TabuadaQuest = root.TabuadaQuest || {};
    const active = new Set();

    function resize(canvas) {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(root.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(rect.width * dpr));
        canvas.height = Math.max(1, Math.round(rect.height * dpr));
        return { width: canvas.width, height: canvas.height, dpr };
    }

    function mount(host) {
        if (!host) return () => {};
        host.innerHTML = '<canvas class="tq-ocean-loader-canvas" aria-hidden="true"></canvas><span class="tq-ocean-loader-label">Carregando...</span>';
        const canvas = host.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        let raf = 0, t = 0;
        const waves = [
            { amp: 10, freq: .02, speed: .05, offset: 0 },
            { amp: 6, freq: .035, speed: .08, offset: 2 },
            { amp: 4, freq: .05, speed: .03, offset: 4 }
        ];
        const seaY = (x, baseY) => waves.reduce((y,w)=>y+Math.sin(x*w.freq+t*w.speed+w.offset)*w.amp, baseY);

        function ship(cx, baseY) {
            const y=seaY(cx,baseY), yl=seaY(cx-45,baseY), yr=seaY(cx+45,baseY);
            ctx.save(); ctx.translate(cx,y-4+Math.sin(t*.05)*2); ctx.rotate(Math.atan2(yr-yl,90));
            ctx.globalAlpha=.22; ctx.fillStyle="#000"; ctx.beginPath(); ctx.ellipse(0,20,55,6,0,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
            ctx.beginPath(); ctx.moveTo(-55,-4); ctx.quadraticCurveTo(-58,14,-38,22); ctx.lineTo(38,22); ctx.quadraticCurveTo(58,14,55,-4); ctx.closePath();
            const hg=ctx.createLinearGradient(0,-4,0,22); hg.addColorStop(0,"#5a3d24"); hg.addColorStop(1,"#2c1c10"); ctx.fillStyle=hg; ctx.fill();
            ctx.strokeStyle="#c9a34e"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-55,-4); ctx.lineTo(55,-4); ctx.stroke();
            ctx.fillStyle="#8a6a3a"; ctx.fillRect(-14,-22,28,18);
            ctx.strokeStyle="#3b2a1a"; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(-5,-22); ctx.lineTo(-5,-85); ctx.stroke();
            const sway=Math.sin(t*.06)*8; ctx.beginPath(); ctx.moveTo(-5,-83); ctx.quadraticCurveTo(22+sway,-55,-5,-24); ctx.closePath();
            const sg=ctx.createLinearGradient(-5,-83,20,-24); sg.addColorStop(0,"#fff"); sg.addColorStop(1,"#e4ddc9"); ctx.fillStyle=sg; ctx.fill();
            ctx.strokeStyle="rgba(59,42,26,.6)"; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(-5,-85); ctx.lineTo(-40,-4); ctx.moveTo(-5,-85); ctx.lineTo(30,-4); ctx.stroke();
            const fw=Math.sin(t*.15)*6; ctx.beginPath(); ctx.moveTo(-5,-85); ctx.lineTo(9+fw,-82); ctx.lineTo(-5,-78); ctx.closePath(); ctx.fillStyle="#c0392b"; ctx.fill();
            ctx.restore();
        }

        function frame() {
            const {width:w,height:h}=resize(canvas), baseY=h*.55;
            const sky=ctx.createLinearGradient(0,0,0,baseY+20); sky.addColorStop(0,"#7ec8e3"); sky.addColorStop(1,"#cfeffd"); ctx.fillStyle=sky; ctx.fillRect(0,0,w,baseY+20);
            const sx=w*.8, sy=h*.18, r=Math.max(18,Math.min(w,h)*.055); ctx.fillStyle="#fff2b0"; ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
            const sea=ctx.createLinearGradient(0,baseY,0,h); sea.addColorStop(0,"#1e6f8e"); sea.addColorStop(1,"#0a3d55");
            ctx.beginPath(); ctx.moveTo(0,h); ctx.lineTo(0,seaY(0,baseY)); for(let x=0;x<=w;x+=6)ctx.lineTo(x,seaY(x,baseY)); ctx.lineTo(w,h); ctx.closePath(); ctx.fillStyle=sea; ctx.fill();
            ctx.strokeStyle="rgba(255,255,255,.25)"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(0,seaY(0,baseY)); for(let x=0;x<=w;x+=6)ctx.lineTo(x,seaY(x,baseY)); ctx.stroke();
            ship(w/2,baseY); t++; raf=root.requestAnimationFrame(frame);
        }
        active.add(host); frame();
        return () => { root.cancelAnimationFrame(raf); active.delete(host); };
    }

    TQ.core = TQ.core || {};
    TQ.core.oceanLoader = Object.freeze({ mount });
})(globalThis);
