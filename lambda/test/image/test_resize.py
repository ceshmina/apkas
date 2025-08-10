from PIL import Image
import pytest
from pytest_mock import MockerFixture

from image.resize import ImageSize, ImageResizer, InputConfig, OutputConfig, OutputFormat


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


class TestImageResizer:
    @pytest.mark.parametrize('format, size, path, error', [
        pytest.param(OutputFormat.WEBP, 100, 'test.webp', None, id='正常な場合'),
        pytest.param('webp', 100, 'test.webp', ValueError, id='フォーマットが不正'),
        pytest.param(OutputFormat.WEBP, 100.5, 'test.webp', ValueError, id='サイズの型が不正'),
        pytest.param(OutputFormat.WEBP, 0, 'test.webp', ValueError, id='サイズの値が不正 (0の場合)'),
        pytest.param(OutputFormat.WEBP, -1, 'test.webp', ValueError, id='サイズの値が不正 (負の場合)'),
        pytest.param(OutputFormat.WEBP, 100, 100, ValueError, id='パスの型が不正'),
        pytest.param(OutputFormat.WEBP, 100, 'test.jpg', ValueError, id='パスの拡張子がフォーマットと一致しない'),
    ])
    def test_verify_output_config(self, format, size, path, error: Exception | None):
        resizer = ImageResizer(InputConfig(path='sample.jpg'))
        if error:
            with pytest.raises(error):
                resizer._verify_output_config(format, size, path)
        else:
            output_config = resizer._verify_output_config(format, size, path)
            assert output_config == OutputConfig(format, size, path)

    def test_add_output(self):
        resizer = ImageResizer(InputConfig(path='sample.jpg'))
        resizer.add_output(OutputFormat.WEBP, 100, 'test1.webp')
        resizer.add_output(OutputFormat.WEBP, 100, 'test2.webp')
        assert resizer._output_configs[0] == OutputConfig(OutputFormat.WEBP, 100, 'test1.webp')
        assert resizer._output_configs[1] == OutputConfig(OutputFormat.WEBP, 100, 'test2.webp')

    @pytest.mark.parametrize('path, dir_path, called', [
        pytest.param('test/medium.webp', 'test', True, id='ディレクトリが必要な場合'),
        pytest.param('medium.webp', '', False, id='ディレクトリが不要な場合'),
    ])
    def test_prepare_directory(self, mocker: MockerFixture, path: str, dir_path: str, called: bool):
        resizer = ImageResizer(InputConfig(path='sample.jpg'))
        mock = mocker.patch('os.makedirs')
        assert resizer._prepare_directory(path) == dir_path
        if called:
            mock.assert_called_once_with(dir_path, exist_ok=True)
        else:
            mock.assert_not_called()

    def test_resize(self):
        resizer = ImageResizer(InputConfig(path='sample/input/001.jpg'))
        output_config = OutputConfig(OutputFormat.WEBP, 1600, 'sample/output/001.webp')
        with Image.open('sample/input/001.jpg') as image:
            output_path, output_size = resizer._resize(image, output_config)
            assert output_path == 'sample/output/001.webp'
            assert output_size.size == (1600, 1067)
        with Image.open(output_path) as image:
            assert image.size == (1600, 1067)

    def test_run(self):
        resizer = ImageResizer(InputConfig(path='sample/input/001.jpg'))
        resizer.add_output(OutputFormat.WEBP, 1600, 'sample/output/001/test1.webp')
        resizer.add_output(OutputFormat.WEBP, 2400, 'sample/output/001/test2.webp')
        resizer.run()
        with Image.open('sample/output/001/test1.webp') as image:
            assert image.size == (1600, 1067)
        with Image.open('sample/output/001/test2.webp') as image:
            assert image.size == (2400, 1601)
