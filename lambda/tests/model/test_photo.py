import pytest

from app.model.photo import PhotoSize


class TestPhotoSize:
    @pytest.mark.parametrize('w, h, raise_exception', [
        pytest.param(100, 50, False, id='正常な場合'),
        pytest.param(0, 50, True, id='wが不正の場合'),
        pytest.param(100, -1, True, id='hが不正の場合'),
        pytest.param(0, -1, True, id='w、hがともに不正の場合'),
    ])
    def test_init_photosize(self, w: int, h: int, raise_exception: bool):
        if raise_exception:
            with pytest.raises(ValueError):
                _ = PhotoSize(w, h)
        else:
            _ = PhotoSize(w, h)

    @pytest.mark.parametrize('w, h, x, new_w, new_h, raise_exception', [
        pytest.param(100, 50, 200, 200, 100, False, id='正常に拡大できる'),
        pytest.param(100, 50, 50, 50, 25, False, id='正常に縮小できる'),
        pytest.param(100, 50, 75, 75, 37, False, id='結果が正数でない場合、切り捨てられる'),
        pytest.param(100, 100, 50, 50, 50, False, id='wとhが同じ場合'),
        pytest.param(30, 40, 20, 15, 20, False, id='wよりhが大きい場合、hを基準にリサイズされる'),
        pytest.param(100, 50, 0, 0, 0, True, id='xが不正の場合'),
    ])
    def test_resize(self, w: int, h: int, x: int, new_w: int, new_h: int, raise_exception: bool):
        s = PhotoSize(w, h)
        if raise_exception:
            with pytest.raises(ValueError):
                s.resize(x)
        else:
            assert s.resize(x) == PhotoSize(new_w, new_h)
