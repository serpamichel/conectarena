package br.com.conectarena.plataforma.Config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Converter
public class CryptoConverter implements AttributeConverter<String, String> {

    private static final String CHAVE = "conectarena12345";
    private static final String ALGORITMO = "AES";

    @Override
    public String convertToDatabaseColumn(String valor) {
        if (valor == null) return null;
        try {
            SecretKeySpec chave = new SecretKeySpec(CHAVE.getBytes(), ALGORITMO);
            Cipher cipher = Cipher.getInstance(ALGORITMO);
            cipher.init(Cipher.ENCRYPT_MODE, chave);
            return Base64.getEncoder().encodeToString(cipher.doFinal(valor.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException("Erro ao criptografar campo", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String valorCifrado) {
        if (valorCifrado == null) return null;
        try {
            SecretKeySpec chave = new SecretKeySpec(CHAVE.getBytes(), ALGORITMO);
            Cipher cipher = Cipher.getInstance(ALGORITMO);
            cipher.init(Cipher.DECRYPT_MODE, chave);
            return new String(cipher.doFinal(Base64.getDecoder().decode(valorCifrado)));
        } catch (Exception e) {
            throw new RuntimeException("Erro ao descriptografar campo", e);
        }
    }
}
