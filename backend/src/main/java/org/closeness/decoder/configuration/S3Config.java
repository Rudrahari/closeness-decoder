package org.closeness.decoder.configuration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
@Slf4j
public class S3Config {

    private final S3Properties props;

    public S3Config(S3Properties s3Properties) {
        this.props = s3Properties;
    }

    @Bean
    public S3Client s3Client() {
        log.info("S3 client created with endpoint={}, region={}",
                props.getEndpoint(), props.getRegion());

        AwsBasicCredentials credentials =
                AwsBasicCredentials.create(props.getAccessKey(), props.getSecretKey());
        AwsCredentialsProvider credentialsProvider =
                StaticCredentialsProvider.create(credentials);

        return S3Client.builder().
                endpointOverride(URI.create(props.getEndpoint())).
                region(Region.of(props.getRegion())).
                credentialsProvider(credentialsProvider).
                serviceConfiguration(S3Configuration.
                        builder().
                        pathStyleAccessEnabled(false). // using virtual hosted style
                                build()).
                build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        AwsBasicCredentials credentials =
                AwsBasicCredentials.create(props.getAccessKey(), props.getSecretKey());
        AwsCredentialsProvider credentialsProvider =
                StaticCredentialsProvider.create(credentials);

        return S3Presigner.builder().
                endpointOverride(URI.create(props.getEndpoint())).
                region(Region.of(props.getRegion())).
                credentialsProvider(credentialsProvider).
                serviceConfiguration(S3Configuration.
                        builder().
                        pathStyleAccessEnabled(false). // using virtual hosted style
                                build()).
                build();
    }
}
