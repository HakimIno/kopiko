import React from 'react'

const Logo = ({ scale = 1 }) => {
    const style = {
        '--logo-scale': scale,
        transform: `scale(var(--logo-scale))`,
        transformOrigin: 'center center'
    }

    return (
        <div className="qlogo" style={style}>
            <div className="poziomq static">
                <figure className="liscie">
                    <span className="lisc-lewy"><span className="after"></span></span>
                    <span className="lisc-lewy drugi"><span className="after"></span></span>
                    <span className="lisc-prawy"><span className="after"></span></span>
                    <span className="lisc-prawy drugi"><span className="after"></span></span>
                    <span className="lodyga"></span>
                </figure>
                <figure className="rece">
                    <span className="reka reka-lewa"></span>
                    <span className="reka reka-prawa"></span>
                </figure>
                <figure className="cialo">
                    <span className="twarz">
                        <span className="oczy">
                            <span className="oko oko-lewe"></span>
                            <span className="oko oko-prawe"></span>
                        </span>
                        <span className="piegi">
                            <span className="pieg pieg-lewy"></span>
                            <span className="pieg pieg-prawy"></span>
                        </span>
                        <span className="buzia">
                            <span className="gardlo"></span>
                            <span className="zuby"></span>
                        </span>
                    </span>
                </figure>
                <figure className="nogi">
                    <span className="noga-lewa"></span>
                    <span className="noga-prawa"></span>
                </figure>
            </div>
            <style jsx>{`
                .poziomq {
                    text-align: center;
                    position: relative;
                    top: 33%;
                    display: inline-block;
                    width: 105px;
                }
                
                .poziomq.static {
                    animation: none;
                }

                /* ลบ animation ของเงา */
                .cien {
                    animation: none;
                }

                /* ลบ animation ของตา */
                .oczy .oko {
                    animation: none;
                }
                
                /* คงไว้เฉพาะ hover effects */
                .poziomq:hover .oczy .oko:before { height: 0px; }
                .poziomq:hover .oczy .oko:after { height: 6px; }
                .poziomq:hover .piegi .pieg { top: 22px; }
                .poziomq:hover .buzia {
                    width: 45px;
                    height: 15px;
                    top: 34px;
                    left: 30px;
                }
                .poziomq:hover .buzia .zuby {
                    width: 45px;
                    height: 0px;
                    top: 0px;
                }
                .poziomq:hover .buzia .gardlo {
                    width: 45px;
                    height: 3px;
                    top: 0px;
                }
            `}</style>
        </div>
    )
}

export default Logo