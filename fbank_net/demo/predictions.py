import torch
import torch.nn.functional as F

from ..model_training.cross_entropy_pre_training.cross_entropy_model import FBankCrossEntropyNet


def get_cosine_distance(a, b):
    a = torch.from_numpy(a)
    b = torch.from_numpy(b)
    
    # Imprimir los vectores de entrada a y b
    print(f"Vector a (embeddings actuales): {a}", flush=True)
    print(f"Vector b (embeddings almacenados): {b}", flush=True)
    
    cosine_distances = 1 - F.cosine_similarity(a, b)
    
    # Imprimir las formas de los vectores de entrada
    print(f"Input vector a shape: {a.shape}", flush=True)
    print(f"Input vector b shape: {b.shape}", flush=True)
    
    # Imprimir las distancias coseno
    print(f"Cosine distances (tensor): {cosine_distances}", flush=True)
    
    return cosine_distances.numpy()


MODEL_PATH = 'weights/triplet_loss_trained_model.pth'
model_instance = FBankCrossEntropyNet()
model_instance.load_state_dict(torch.load(MODEL_PATH, map_location=lambda storage, loc: storage))
model_instance = model_instance.double()
model_instance.eval()


def get_embeddings(x):
    print(f"Input fbanks shape: {x.shape}", flush=True)
    x = torch.from_numpy(x)
    
    with torch.no_grad():
        embeddings = model_instance(x)
    
    embeddings_np = embeddings.numpy()
    
    # Imprimir los embeddings generados
    print(f"Generated embeddings: {embeddings_np}", flush=True)
    
    return embeddings_np
