import pytest

from image.resize import ImageSize


class TestImageSize:
    def test_get_size(self):
        size = ImageSize(100, 50)
        assert size.size == (100, 50)

    def test_repr(self):
        size = ImageSize(100, 50)
        assert str(size) == '100x50'
        assert repr(size) == '100x50'

    @pytest.mark.parametrize('old_w, old_h, new_size, new_w, new_h', [
        pytest.param(100, 50, 100, 100, 50, id='サイズが変わらない場合'),
        pytest.param(100, 50, 200, 200, 100, id='大きくする場合'),
        pytest.param(100, 50, 50, 50, 25, id='小さくする場合'),
        pytest.param(100, 100, 50, 50, 50, id='正方形の画像の場合'),
        pytest.param(100, 200, 100, 50, 100, id='縦の方が長い画像の場合'),
        pytest.param(100, 75, 150, 150, 112, id='拡大で割り切れない場合は切り捨てとなる'),
        pytest.param(100, 75, 50, 50, 37, id='縮小で割り切れない場合は切り捨てとなる'),
    ])
    def test_resize(self, old_w: int, old_h: int, new_size: int, new_w: int, new_h: int):
        old = ImageSize(old_w, old_h)
        new = old.resize(new_size)
        assert new.size == (new_w, new_h)
