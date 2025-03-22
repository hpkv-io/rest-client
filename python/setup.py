from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="hpkv-client",
    version="0.1.0",
    author="HPKV Team",
    author_email="info@hpkv.io",
    description="A Python client for the HPKV API",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/hpkv/python-client",
    project_urls={
        "Bug Tracker": "https://github.com/hpkv/python-client/issues",
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    packages=find_packages(),
    python_requires=">=3.7",
    install_requires=[
        "requests>=2.25.0",
        "aiohttp>=3.7.0",
    ],
) 