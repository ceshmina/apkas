from dataclasses import dataclass


@dataclass
class PhotoSize:
    w: int
    h: int

    def __init__(self, w: int, h: int):
        if w <= 0 or h <= 0:
            raise ValueError('写真のサイズが不正です: w、hはともに正である必要があります')
        self.w = w
        self.h = h

    def to_tuple(self) -> tuple[int, int]:
        return (self.w, self.h)

    def resize(self, x: int) -> 'PhotoSize':
        if x <= 0:
            raise ValueError('写真のサイズが不正です: リサイズ後のxは正である必要があります')
        if self.w >= self.h:
            new_w = x
            new_h = int(self.h * x / self.w)
        else:
            new_w = int(self.w * x / self.h)
            new_h = x
        return PhotoSize(new_w, new_h)
