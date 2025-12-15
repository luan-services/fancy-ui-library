export const calculateBottomAvaliableSpace = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    return viewportHeight - rect.bottom;
}

export const calculateTopAvaliableSpace = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return rect.top;
}