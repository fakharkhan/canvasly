import { ReactNode, useEffect, useRef, useState } from 'react';

interface CommentPositionerProps {
    children: ReactNode;
    defaultLeft?: number;
    defaultTop?: number;
}

export default function CommentPositioner({ 
    children, 
    defaultLeft = -268, 
    defaultTop = 0 
}: CommentPositionerProps) {
    const [position, setPosition] = useState({ left: `${defaultLeft}px`, top: `${defaultTop}px` });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const adjustPosition = () => {
            if (!containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const parentRect = containerRef.current.parentElement?.getBoundingClientRect();

            if (!parentRect) return;

            let newLeft = defaultLeft;
            let newTop = defaultTop;

            // Check left boundary
            if (parentRect.left < Math.abs(defaultLeft)) {
                newLeft = 24; // Position to the right
            }

            // Check right boundary
            if (parentRect.left + containerRect.width > window.innerWidth && newLeft > 0) {
                newLeft = -(containerRect.width + 24); // Position to the left
            }

            // Check bottom boundary
            if (parentRect.top + containerRect.height > window.innerHeight) {
                newTop = -(containerRect.height + 8); // Position above
            }

            // Check top boundary
            if (parentRect.top + newTop < 0) {
                newTop = 24; // Position below
            }

            setPosition({ left: `${newLeft}px`, top: `${newTop}px` });
        };

        adjustPosition();
        window.addEventListener('resize', adjustPosition);
        window.addEventListener('scroll', adjustPosition);

        return () => {
            window.removeEventListener('resize', adjustPosition);
            window.removeEventListener('scroll', adjustPosition);
        };
    }, [defaultLeft, defaultTop]);

    return (
        <div 
            ref={containerRef}
            className="absolute"
            style={{ left: position.left, top: position.top }}
        >
            {children}
        </div>
    );
} 