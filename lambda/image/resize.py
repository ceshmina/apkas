from PIL import Image


def resize(input_path: str, output_path: str) -> None:
    with Image.open(input_path) as i:
        i.save(output_path)
