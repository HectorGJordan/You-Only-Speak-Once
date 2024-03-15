FROM python:3.10-buster

RUN pip install numpy==1.21
RUN pip install flask==2.2.2
RUN pip install torch==2.1.2 torchvision==0.16.2 torchaudio==2.1.2 --index-url https://download.pytorch.org/whl/cpu
RUN pip install librosa==0.10.1
RUN pip install python-speech-features==0.6
RUN pip install Werkzeug==2.2.2

RUN apt-get update -y
RUN apt-get install -y libsndfile1

COPY fbank_net/demo /fbank_net/demo
COPY fbank_net/model_training /fbank_net/model_training
COPY fbank_net/weights /fbank_net/weights
RUN touch /fbank_net/__init__.py

RUN mkdir /fbank_net/data_files

ENV PYTHONPATH="/fbank_net"
ENV FLASK_APP="demo/app.py"

WORKDIR /fbank_net

EXPOSE 5000

CMD ["flask", "run", "--host", "0.0.0.0"]
